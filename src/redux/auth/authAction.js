import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginApi,
  logoutApi,
  getProfileApi,
  updateFCMTokenApi,
  refreshTokenApi,
} from '../../api/auth.api';

export const loginAction = createAsyncThunk(
  'auth/login',
  async ({email, password}, {rejectWithValue}) => {
    try {
      const response = await loginApi(email, password);
      if (response.success) {
        return {
          message: response.message,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user
        };
      } else {
        return rejectWithValue(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi');
    }
  },
);

export const logoutAction = createAsyncThunk(
  'auth/logout',
  async (_, {rejectWithValue}) => {
    try {
      const response = await logoutApi();
      if (response.success) {
        return {
          message: response.message
        };
      } else {
        return rejectWithValue(response.message || 'Đăng xuất thất bại');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Đã xảy ra lỗi');
    }
  },
);

export const getUserInfoAction = createAsyncThunk(
  'auth/getUserProfile',
  async (_, {rejectWithValue}) => {
    try {
      const response = await getProfileApi();
      if (response.success) {
        return {
          user: response.user
        };
      } else {
        console.error('Lỗi khi lấy thông tin người dùng:', response.message);
        return rejectWithValue(response.message || 'Không thể lấy thông tin người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      return rejectWithValue(error.message || 'Đã xảy ra lỗi');
    }
  },
);

export const refreshTokenAction = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const { getRefreshTokenFromStorage } = require('../../utils/tokenUtils');
      const refreshToken = await getRefreshTokenFromStorage();
      
      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const response = await refreshTokenApi(refreshToken);
      
      if (response.success && response.accessToken) {
        return {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        };
      } else {
        return rejectWithValue(response.message || 'Làm mới token thất bại');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Làm mới token thất bại');
    }
  },
);

export const updateFCMTokenAction = createAsyncThunk(
  'auth/updateFCMToken',
  async ({fcmToken, accessToken}, {rejectWithValue}) => {
    try {
      const response = await updateFCMTokenApi(fcmToken, accessToken);
      if (response.success) {
        return {
          message: response.message
        };
      } else {
        return rejectWithValue(response.message || 'Cập nhật FCM token thất bại');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Đã xảy ra lỗi');
    }
  },
);
