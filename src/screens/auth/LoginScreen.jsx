import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/common/CustomButton';
import CustomTextInput from '../../components/common/CustomTextInput';
import logo from '../../assets/images/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { loginAction, updateFCMTokenAction} from '../../redux/auth/authAction';
import { getFCMTokenFromStorage, saveFCMToken } from '../../utils/tokenUtils';
import { navigateBasedOnRole } from '../../utils/navigationHelpers';
import { useNavigation } from '@react-navigation/native';
import { getApp, getMessaging } from '@react-native-firebase/app';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);
  const navigation = useNavigation();

  const validateForm = useCallback(() => {
    let isValid = true;
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setError('');

    // Validate email
    if (!email?.trim()) {
      setEmailError('Vui lòng nhập email');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Vui lòng nhập đúng định dạng email');
        isValid = false;
      }
    }

    // Validate password
    if (!password?.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    return isValid;
  }, [email, password]);


  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError('');
    if (error) setError('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (error) setError('');
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Clear field errors before login attempt
    setEmailError('');
    setPasswordError('');
    
    try {
      const resultAction = await dispatch(loginAction({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      }));
      
      // Check if resultAction exists before trying to match
      if (!resultAction) {
        console.error('Login action returned undefined');
        setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
        return;
      }
      
      if (loginAction.fulfilled.match(resultAction)) {
        const { user, accessToken } = resultAction.payload;
        console.log('Đăng nhập thành công:', user?.email);
        console.log('Role:', user?.role);
        console.log('Access Token:', accessToken);
        console.log('Bắt đầu gọi updateFCMTokenInBackground...');

        // cập nhật FCM token với access token
        await updateFCMTokenInBackground(accessToken);

        // Điều hướng dựa trên role
        navigateBasedOnRole(navigation, user?.role, handleUnknownRole);

      } else if (loginAction.rejected.match(resultAction)) {
        console.error('Đăng nhập thất bại', resultAction);
        const errorMessage = resultAction.payload || 'Đăng nhập thất bại';
        setError(errorMessage);
        // Set field errors based on the error message
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('email')) {
          setEmailError(errorMessage);
        } else if (errorMessage.toLowerCase().includes('mật khẩu') || errorMessage.toLowerCase().includes('password')) {
          setPasswordError(errorMessage);
        } else {
          // General error, display in both fields for visibility
          setEmailError(errorMessage);
          setPasswordError(errorMessage);
        }
      } else {
        console.log('Đăng nhập thất bại', resultAction);
        setError('Đăng nhập thất bại');
        setEmailError('Đăng nhập thất bại');
        setPasswordError('Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      const errorMessage = err.message || 'Đã có lỗi xảy ra';
      setError(errorMessage);
      setEmailError(errorMessage);
      setPasswordError(errorMessage);
    }
  };


  const updateFCMTokenInBackground = async (accessToken) => {
    try {
      console.log('Bắt đầu cập nhật FCM token...');
      let fcmToken = await getFCMTokenFromStorage();
      console.log('FCM token từ storage:', fcmToken);
      
      // Nếu không có token trong storage, thử lấy mới
      if (!fcmToken) {
        console.log('Không tìm thấy FCM token trong storage, đang lấy token mới...');
        try {
          const messagingInstance = getMessaging(getApp());
          fcmToken = await messagingInstance.getToken();
          if (fcmToken) {
            console.log('Lấy FCM token mới thành công:', fcmToken);
            await saveFCMToken(fcmToken);
          }
        } catch (tokenError) {
          console.error('Lỗi khi lấy FCM token mới:', tokenError);
        }
      }
      
      if (fcmToken) {
        console.log('Đang dispatch updateFCMTokenAction với token:', fcmToken);
        const resultAction = await dispatch(updateFCMTokenAction({
          fcmToken: fcmToken,
          accessToken: accessToken
        }));
        
        // Check if resultAction exists before trying to match
        if (resultAction) {
          if (updateFCMTokenAction.fulfilled.match(resultAction)) {
            console.log('FCM token updated successfully', resultAction.payload);
          } else if (updateFCMTokenAction.rejected.match(resultAction)) {
            console.error('FCM token update failed', resultAction.error);
          } else {
            console.log('FCM token update result', resultAction);
          }
        } else {
          console.warn('FCM token update action returned undefined');
        }
      } else {
        console.warn('Không thể lấy FCM token');
      }
    } catch (fcmError) {
      console.error('FCM token update failed:', fcmError.message);
      console.error('Full error:', fcmError);
      // Don't show error to user as this is not critical for login flow
    }
  };

  // Helper function to handle unknown role
  const handleUnknownRole = (userRole) => {
    Alert.alert('Cảnh báo', 'Vai trò người dùng không xác định. Vui lòng liên hệ quản trị viên.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="cover" />
            </View>
            <Text style={styles.subtitle}>
              Đăng nhập để quản lý công việc của bạn
            </Text>

            <CustomTextInput
              label="Email"
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
            />

            <CustomTextInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              error={passwordError}
            />

            <CustomButton
              title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
            />

            {error && (
              <Text style={styles.generalErrorText}>{error}</Text>
            )}

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => console.log('Forgot password')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  forgotPasswordButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  generalErrorText: {
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  logo: {
    width: 220,
    height: 120,
    borderRadius: 60,
  },
  // New styles for enhanced features
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  passwordToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  passwordToggleText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  clearFormButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearFormText: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
