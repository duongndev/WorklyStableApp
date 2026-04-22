import axios from 'axios';
import { axiosClient } from "./api.service";

export const loginApi = async (email, password) => {
  try {
    const response = await axiosClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi đăng nhập:', error);
    throw error;
  }
};

export const logoutApi = async () => {
  try {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.log('Lỗi khi đăng xuất:', error.response?.data || error.message);
    throw error;
  }
};

export const updateFCMTokenApi = async (fcmToken, accessToken) => {
  try {
    console.log('Đang gọi updateFCMTokenApi với token:', fcmToken);
    
    // Create a separate axios instance with Authorization header
    const axiosWithAuth = axios.create({
      baseURL: axiosClient.defaults.baseURL,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const response = await axiosWithAuth.put('/auth/update-fcm-token', {
      fcmToken,
    });
    console.log('Response từ updateFCMTokenApi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật FCM token:', error.response?.data || error.message);
    console.error('Full error object:', error);
    throw error;
  }
};

export const refreshTokenApi = async (refreshToken) => {
  try {
    const response = await axios.post('/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi làm mới token:', error.response?.data || error.message);
    throw error;
  }
};

export const getProfileApi = async () => {
  try {
    const response = await axiosClient.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy hồ sơ:', error.response?.data || error.message);
    throw error;
  }
};