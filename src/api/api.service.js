import axios from 'axios';
import { Platform } from 'react-native';
import { refreshTokenApi } from './auth.api';
import { getRefreshTokenFromStorage, saveToken, removeToken } from '../utils/tokenUtils';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

let storeInstance = null;
let isRefreshing = false;
let failedQueue = [];

export const setStore = (newStore) => {
  storeInstance = newStore;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosClient.interceptors.request.use(
  (config) => {
    try {
      if (storeInstance) {
        const state = storeInstance.getState();
        if (state && state.auth && state.auth.accessToken) {
          config.headers.Authorization = `Bearer ${state.auth.accessToken}`;
        }
      }
    } catch (error) {
      console.log('Error getting access token from store:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshTokenFromStorage();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await refreshTokenApi(refreshToken);
        
        if (response.success && response.accessToken) {
          // Save new tokens
          await saveToken(response.accessToken, response.refreshToken);
          
          // Update Redux store
          if (storeInstance) {
            storeInstance.dispatch({
              type: 'auth/refreshToken/fulfilled',
              payload: {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken
              }
            });
          }

          // Process queued requests
          processQueue(null, response.accessToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          return axiosClient(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        
        if (storeInstance) {
          storeInstance.dispatch({ type: 'auth/logoutUser' });
        }
        
        await removeToken();
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Tạo instance axios riêng để luôn gửi User-Agent
const nominatimApi = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  timeout: 10000,
  headers: {
    'User-Agent': 'WorklyHR/1.0 (worklyhr@gmail.com)',
    'Accept-Language': 'vi',
  },
});

// Throttle for Nominatim: 1 request/second
let nominatimThrottleChain = Promise.resolve();
let nominatimNextAvailableAt = 0;
const NOMINATIM_THROTTLE_MS = 1000;

nominatimApi.interceptors.request.use(async config => {
  // Chain delays to serialize requests at most 1/second
  const now = Date.now();
  const waitMs = Math.max(0, nominatimNextAvailableAt - now);
  nominatimThrottleChain = nominatimThrottleChain.then(
    () =>
      new Promise(resolve => {
        setTimeout(resolve, waitMs);
      }),
  );
  await nominatimThrottleChain;
  nominatimNextAvailableAt = Date.now() + NOMINATIM_THROTTLE_MS;
  return config;
});

// In-memory cache for reverse geocoding results
const reverseGeocodeCache = new Map();
const REVERSE_GEOCODE_TTL = 10 * 60 * 1000; // 10 minutes
const formatCoordKey = (lat, lon) => {
  // Round to 5 decimals to avoid tiny jitter causing cache misses (~1m precision)
  const rlat = Number(lat).toFixed(5);
  const rlon = Number(lon).toFixed(5);
  return `${rlat},${rlon}`;
};

export { axiosClient, nominatimApi };
