import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../../redux/auth/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({
  title,
  canGoBack,
  rightActions,
  username,
  onNotificationPress,
  unreadCount = 0,
  showNotification = false,
  showLogout = false,
  backgroundColor,
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Thông báo', 'Bạn có chắc chắn muốn đăng xuất không?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Đăng xuất',
        onPress: async () => {
          const resultAction = await dispatch(logoutUser());
          // Check if resultAction exists before trying to match
          if (resultAction && logoutUser.fulfilled.match(resultAction)) {
            navigation.replace('Login');
          } else {
            navigation.replace('Login');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const actions =
    rightActions ??
    [
      ...(showNotification
        ? [
            {
              icon: 'notifications-outline',
              onPress:
                onNotificationPress ?? (() => navigation.navigate('Notification')),
              badgeCount: unreadCount,
            },
          ]
        : []),
      ...(showLogout
        ? [
            {
              icon: 'log-out-outline',
              onPress: handleLogout,
            },
          ]
        : []),
    ];

  const headerBg = backgroundColor ?? colors.primary;
  const showTitle = Boolean(title) && !username;

  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: insets.top + 10,
          backgroundColor: headerBg,
        },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {username ? (
        <View style={styles.row}>
          <View style={styles.homeLeft}>
            <Text style={styles.greeting}>Chào bạn,</Text>
            <Text style={styles.username} numberOfLines={1}>
              {username}
            </Text>
          </View>

          <View style={styles.homeRight}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <Icon name={action.icon} size={24} color="#FFFFFF" />
                {action.badgeCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {action.badgeCount > 9 ? '9+' : action.badgeCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.leftSlot}>
            {canGoBack && navigation.canGoBack() ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.8}
              >
                <Icon name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.slotSpacer} />
            )}
          </View>

          <View style={styles.centerSlot}>
            {showTitle && <Text style={styles.title}>{title}</Text>}
          </View>

          <View style={styles.rightSlot}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <Icon name={action.icon} size={24} color="#FFFFFF" />
                {action.badgeCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {action.badgeCount > 9 ? '9+' : action.badgeCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {actions.length === 0 && <View style={styles.slotSpacer} />}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSlot: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  rightSlot: {
    minWidth: 44,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  username: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  slotSpacer: {
    width: 44,
    height: 44,
  },
  homeLeft: {
    flex: 1,
    paddingRight: 12,
  },
  homeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;
