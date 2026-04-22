import React, { useEffect, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigations/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { getMessaging, getToken, getInitialNotification, onNotificationOpenedApp, onMessage, requestPermission as requestNotificationPermission } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { saveFCMToken } from './src/utils/tokenUtils';
import {
  Toast,
  AlertNotificationRoot,
  ALERT_TYPE,
  Dialog,
} from 'react-native-alert-notification';
import { navigate } from './src/navigations/NavigationService';
import useStartupPermissions from './src/hooks/useStartupPermissions';
import { PermissionsAndroid, Platform, StatusBar, Linking } from 'react-native';
import { AuthorizationStatus } from '@react-native-firebase/messaging';
import { updateFCMTokenApi } from './src/api/auth.api';
import store from './src/redux/store';

const App = () => {
const updateFCMTokenOnServer = useCallback(async token => {
    try {
      await updateFCMTokenApi(token);
    } catch (error) {
      console.log('Error updating FCM token on server:', error);
    }
  }, []);

  // Get FCM token
  const getFCMToken = useCallback(async () => {
    try {
      const fcmToken = await getToken(getMessaging(getApp()));
      if (fcmToken) {
        console.log('FCM Token: ', fcmToken);
        await saveFCMToken(fcmToken);
        const state = store.getState();
        if (state.auth.token) {
          updateFCMTokenOnServer(fcmToken);
        }
      } else {
        console.log('FCM Token not available');
      }
    } catch (error) {
      console.log('Error getting FCM Token: ', error);
    }
  }, [updateFCMTokenOnServer]);

  // Request notification permissions
  const requestUserPermission = useCallback(async () => {
    try {
      const authStatus = await requestNotificationPermission(getMessaging(getApp()));
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted:', authStatus);
        await getFCMToken();
      } else {
        console.log('Notification permission denied:', authStatus);
        Dialog.show({
          title: 'Cần quyền thông báo',
          textBody: 'Vui lòng bật quyền thông báo trong cài đặt để nhận thông báo quan trọng từ ứng dụng.',
          buttonPositive: { 
            text: 'Đã hiểu',
            onPress: () => {
              // Optional: Navigate to app settings
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              }
            }
          },
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Dialog.show({
        title: 'Lỗi',
        textBody: 'Không thể yêu cầu quyền thông báo. Vui lòng thử lại.',
        buttonPositive: { text: 'OK' },
      });
    }
  }, [getFCMToken]);

  useEffect(() => {
    // Chỉ setup FCM một lần khi app khởi động
    requestUserPermission();

    const unsubscribe = onMessage(getMessaging(getApp()), async remoteMessage => {
      Toast.show({
        type: ALERT_TYPE.INFO,
        title: remoteMessage.notification?.title || 'Thông báo mới',
        textBody: remoteMessage.notification?.body || '',
        onPress: () => {
          Toast.hide();
          navigate('Notification');
        },
      });
    });

   const unsubscribeNotificationOpened = onNotificationOpenedApp(getMessaging(getApp()), remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      navigate('Notification');
    });

    getInitialNotification(getMessaging(getApp())).then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
        navigate('Notification');
      }
    });

    return () => {
      unsubscribe();
      unsubscribeNotificationOpened();
    };
  }, [requestUserPermission]);

  // Request location and notification permissions on app startup
  useStartupPermissions();

  return (
    <SafeAreaProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ThemeProvider>
        <AlertNotificationRoot>
          <AppNavigator />
        </AlertNotificationRoot>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
