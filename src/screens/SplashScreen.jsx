import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import logo from '../assets/images/logo.png';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { isTokenExpired } from '../utils/tokenUtils';
import { logoutUser, clearError, clearMessage } from '../redux/auth/authSlice';
import { getUserInfoAction } from '../redux/auth/authAction';
import { navigateBasedOnRole } from '../utils/navigationHelpers';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { accessToken, user, loading } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Use refs to avoid re-running useEffect when these values change
  const navigationRef = useRef(navigation);
  const dispatchRef = useRef(dispatch);
  const accessTokenRef = useRef(accessToken);
  
  // Update refs when values change
  useEffect(() => {
    navigationRef.current = navigation;
    dispatchRef.current = dispatch;
    accessTokenRef.current = accessToken;
  });

  useEffect(() => {
    // Kiểm tra và xử lý authentication chỉ một lần khi component mount
    const handleAuthentication = async () => {
      const currentNavigation = navigationRef.current;
      const currentDispatch = dispatchRef.current;
      const currentAccessToken = accessTokenRef.current;
      
      // Clear previous errors
      currentDispatch(clearError());
      currentDispatch(clearMessage());

      // Kiểm tra accessToken có tồn tại và chưa hết hạn
      if (!currentAccessToken) {
        console.log('Không có access token, chuyển đến màn hình đăng nhập');
        currentDispatch(logoutUser());
        currentNavigation.navigate('Login');
        return;
      }

      try {
        const tokenExpired = await isTokenExpired(currentAccessToken);
        if (tokenExpired) {
          console.log('Access token đã hết hạn, chuyển đến màn hình đăng nhập');
          currentDispatch(logoutUser());
          currentNavigation.navigate('Login');
          return;
        }

        // Dispatch getProfile async thunk
        console.log('Đang lấy thông tin profile...');
        const resultAction = await currentDispatch(getUserInfoAction());

        // Check if resultAction exists before trying to match
        if (!resultAction) {
          console.error('Get user info action returned undefined');
          currentNavigation.navigate('Login');
          return;
        }

        // Kiểm tra kết quả của async thunk
        if (getUserInfoAction.fulfilled.match(resultAction)) {
          const userData = resultAction.payload.user;
          console.log('Lấy thông tin profile thành công:', {
            userId: userData._id,
            email: userData.email,
            role: userData.role,
            name: userData.fullName,
          });

          // Điều hướng dựa trên role
          navigateBasedOnRole(currentNavigation, userData.role, () => {
            console.warn('Role không được hỗ trợ:', userData.role);
            currentDispatch(logoutUser());
            currentNavigation.navigate('Login');
          });
        } else if (getUserInfoAction.rejected.match(resultAction)) {
          console.error('Lỗi khi lấy thông tin profile:', resultAction.payload);

          // Xử lý lỗi dựa trên loại lỗi
          const errorMessage = resultAction.payload;
          if (errorMessage && errorMessage.includes('401')) {
            console.log('Token không hợp lệ, đăng xuất');
            currentDispatch(logoutUser());
          }

          currentNavigation.navigate('Login');
        } else {
          console.log('Token hợp lệ nhưng không có profile, chuyển đến màn hình đăng nhập');
          currentNavigation.navigate('Login');
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra token:', err);
        currentDispatch(logoutUser());
        currentNavigation.navigate('Login');
      }
    };

    // Chỉ chạy một lần khi component mount
    handleAuthentication();
  }, []); // Empty dependency array - chỉ chạy một lần khi mount

  console.log('SplashScreen rendered with accessToken:', accessToken, 'user:', user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      {loading && <ActivityIndicator size="large" color="#4F46E5" />}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Or match your app theme color
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
  },
});

export default SplashScreen;
