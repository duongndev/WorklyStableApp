import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const isTokenExpired = token => {
  if (!token) {
    console.warn('Token is null or undefined.');
    return true;
  }

  try {
    const decoded = jwtDecode(token);
    if (typeof decoded.exp === 'undefined') {
      console.warn('Token does not contain an expiration time (exp).');
      return true;
    }
    if (typeof decoded.iat === 'undefined') {
      console.warn('Token does not contain an issued at time (iat).');
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime || decoded.iat > currentTime;
  } catch (error) {
    console.error('Error decoding token or token is invalid:', error);
    return true;
  }
};

export const saveFCMToken = async token => {
  try {
    await AsyncStorage.setItem('fcmToken', token);
  } catch (error) {
    console.error('Error saving FCM token:', error);
    throw error;
  }
};

export const saveToken = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    console.log('Tokens đã được lưu thành công vào AsyncStorage');
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
};

export const getFCMTokenFromStorage = async () => {
  try {
    return await AsyncStorage.getItem('fcmToken');
  } catch (error) {
    console.log('Error getting FCM Token from storage:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    console.log('Tokens đã được xóa thành công khỏi AsyncStorage');
  } catch (error) {
    console.error('Error removing tokens:', error);
    throw error;
  }
};

export const removeFCMToken = async () => {
  try {
    await AsyncStorage.removeItem('fcmToken');
    console.log('FCM Token removed successfully');
  } catch (error) {
    console.error('Error removing FCM token:', error);
    throw error;
  }
};

export const getTokenFromStorage = async () => {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch (error) {
    console.log('Error getting access token from storage:', error);
    return null;
  }
};

export const getRefreshTokenFromStorage = async () => {
  try {
    return await AsyncStorage.getItem('refreshToken');
  } catch (error) {
    console.log('Error getting refresh token from storage:', error);
    return null;
  }
};
