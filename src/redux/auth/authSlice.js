import { createSlice } from '@reduxjs/toolkit';
import { loginAction, logoutAction, getUserInfoAction, updateFCMTokenAction, refreshTokenAction } from './authAction';
import { saveToken, removeToken } from '../../utils/tokenUtils';

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  message: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.message = null;
      state.loading = false;
      state.error = null;
      
      // Xóa tokens khỏi AsyncStorage khi manual logout
      removeToken();
    },
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginAction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        
        // Lưu tokens vào AsyncStorage
        if (action.payload.accessToken) {
          saveToken(action.payload.accessToken, action.payload.refreshToken);
        }
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.message = action.payload?.message || 'Đăng nhập thất bại';
        state.error = action.payload?.message || 'Đăng nhập thất bại';
      });

    // logout
    builder
      .addCase(logoutAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.message = action.payload.message;
        state.error = null;
        
        // Xóa tokens khỏi AsyncStorage
        removeToken();
      })
      .addCase(logoutAction.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.message = action.payload?.message || 'Có lỗi xảy ra khi đăng xuất';
        state.error = action.payload?.message || 'Có lỗi xảy ra khi đăng xuất';
      });

    // get user info
    builder
      .addCase(getUserInfoAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserInfoAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(getUserInfoAction.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.message = action.payload || 'Không thể lấy thông tin người dùng';
        state.error = action.payload || 'Không thể lấy thông tin người dùng';
      });

    // update fcm token
    builder
      .addCase(updateFCMTokenAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFCMTokenAction.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updateFCMTokenAction.rejected, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || 'Cập nhật FCM token thất bại';
        state.error = action.payload?.message || 'Cập nhật FCM token thất bại';
      });

    // refresh token
    builder
      .addCase(refreshTokenAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshTokenAction.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        
        // Lưu tokens mới vào AsyncStorage
        if (action.payload.accessToken) {
          saveToken(action.payload.accessToken, action.payload.refreshToken);
        }
      })
      .addCase(refreshTokenAction.rejected, (state, action) => {
        state.loading = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = action.payload || 'Làm mới token thất bại';
        
        // Xóa tokens khi refresh thất bại
        removeToken();
      });
  },
});

export const { logoutUser, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
