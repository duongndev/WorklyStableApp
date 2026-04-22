import {useEffect, useState} from 'react';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Request location and notification permissions on app startup.
 * Shows a rationale alert before requesting permissions.
 */
const useStartupPermissions = () => {
  const [granted, setGranted] = useState({location: false, notifications: false});

  // Lưu trạng thái quyền vào AsyncStorage
  const savePermissionStatus = async (status) => {
    try {
      await AsyncStorage.setItem('permissionsRequested', JSON.stringify(status));
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  };

  // Lấy trạng thái quyền từ AsyncStorage
  const getPermissionStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('permissionsRequested');
      return status ? JSON.parse(status) : null;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return null;
    }
  };

  // Reset trạng thái quyền (dùng khi logout nếu cần)
  const resetPermissionStatus = async () => {
    try {
      await AsyncStorage.removeItem('permissionsRequested');
    } catch (error) {
      console.error('Error resetting permission status:', error);
    }
  };

  useEffect(() => {
    const checkLocationGranted = async () => {
      try {
        if (Platform.OS === 'ios') {
          const status = await Geolocation.requestAuthorization('whenInUse');
          return status === 'granted' || status === 'always';
        }
        const status = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return status === true;
      } catch (e) {
        console.error('Error checking location permission:', e);
        return false;
      }
    };

    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'ios') {
          const status = await Geolocation.requestAuthorization('whenInUse');
          return status === 'granted' || status === 'always';
        }
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí',
            message:
              'Ứng dụng cần quyền vị trí để ghi nhận chính xác địa điểm khi bạn chấm công.',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        return status === PermissionsAndroid.RESULTS.GRANTED;
      } catch (e) {
        console.error('Error requesting location permission:', e);
        return false;
      }
    };

    const checkNotificationGranted = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const status = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return status === true;
        }
        // iOS permission is handled via Firebase messaging in App.jsx
        return true;
      } catch (e) {
        console.error('Error checking notification permission:', e);
        return false;
      }
    };

    const requestNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return status === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch (e) {
        console.error('Error requesting notification permission:', e);
        return false;
      }
    };

    const init = async () => {
      // Kiểm tra xem người dùng đã xác nhận quyền trước đó chưa
      const savedStatus = await getPermissionStatus();
      if (savedStatus) {
        setGranted(savedStatus);
        return;
      }

      const [locGranted, notiGranted] = await Promise.all([
        checkLocationGranted(),
        checkNotificationGranted(),
      ]);

      // Nếu cả 2 đã cấp quyền thì không hiển thị gì nữa
      if (locGranted && notiGranted) {
        const status = {location: true, notifications: true};
        setGranted(status);
        await savePermissionStatus(status);
        return;
      }

      // Chỉ hiển thị yêu cầu nếu còn thiếu quyền
      Alert.alert(
        'Cho phép quyền truy cập',
        'Để trải nghiệm đầy đủ, vui lòng cho phép: \n\n• Vị trí: chấm công đúng địa điểm\n• Thông báo: lịch nghỉ, làm thêm',
        [
          {
            text: 'Để sau',
            style: 'cancel',
            onPress: async () => {
              const [loc, noti] = await Promise.all([
                locGranted ? Promise.resolve(true) : requestLocationPermission(),
                notiGranted ? Promise.resolve(true) : requestNotificationPermission(),
              ]);
              const status = {location: loc, notifications: noti};
              setGranted(status);
              await savePermissionStatus(status);
            },
          },
          {
            text: 'Tiếp tục',
            onPress: async () => {
              const [loc, noti] = await Promise.all([
                locGranted ? Promise.resolve(true) : requestLocationPermission(),
                notiGranted ? Promise.resolve(true) : requestNotificationPermission(),
              ]);
              const status = {location: loc, notifications: noti};
              setGranted(status);
              await savePermissionStatus(status);
            },
          },
        ],
        {cancelable: true},
      );
    };

    init();
  }, []);

  return { granted, resetPermissionStatus };
};

export default useStartupPermissions;


