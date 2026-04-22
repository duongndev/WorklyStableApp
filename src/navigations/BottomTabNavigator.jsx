import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/employee/home/HomeScreen';
import HistoryScreen from '../screens/employee/history/HistoryScreen';
import LeaveHistoryScreen from '../screens/employee/leave/LeaveHistoryScreen';
import OvertimeHistoryScreen from '../screens/employee/overtime/OvertimeHistoryScreen';
import ProfileScreen from '../screens/employee/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  {
    route: 'HomeTab',
    label: 'Trang chủ',
    activeIcon: 'home',
    inActiveIcon: 'home-outline',
    component: HomeScreen,
  },
  {
    route: 'HistoryTab',
    label: 'Chấm công',
    activeIcon: 'fingerprint',
    inActiveIcon: 'fingerprint-outline',
    component: HistoryScreen,
  },
  {
    route: 'LeaveHistoryTab',
    label: 'Đơn nghỉ',
    activeIcon: 'beach',
    inActiveIcon: 'beach-outline',
    component: LeaveHistoryScreen,
  },
  {
    route: 'OvertimeHistoryTab',
    label: 'Làm thêm',
    activeIcon: 'clock-time-eight',
    inActiveIcon: 'clock-time-eight-outline',
    component: OvertimeHistoryScreen,
  },
  {
    route: 'ProfileTab',
    label: 'Cá nhân',
    activeIcon: 'account',
    inActiveIcon: 'account-outline',
    component: ProfileScreen,
  },
];

const BottomTabNavigator = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const current =
          TAB_CONFIG.find(tab => tab.route === route.name) || TAB_CONFIG[0];

        const badgeOptions =
          current.badge && current.badge > 0
            ? { tabBarBadge: current.badge }
            : {};

        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabel: current.label,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subText,
          tabBarIcon: ({ focused, color }) => {
            const iconName = focused
              ? current.activeIcon
              : current.inActiveIcon;

            return (
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={color}
              />
            );
          },
          tabBarStyle: {
            height: 65,
            position: 'absolute',
            bottom: 25,
            left: 20,
            right: 20,
            marginStart: 15,
            marginEnd: 15,
            marginBottom: 15,
            borderRadius: 20,
            backgroundColor: colors.card,
            borderTopWidth: 0,
            elevation: 5,
            shadowColor: colors.shadow,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            paddingBottom: 6,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
          },
          ...badgeOptions,
        };
      }}
    >
      {TAB_CONFIG.map(item => (
        <Tab.Screen
          key={item.route}
          name={item.route}
          component={item.component}
          options={{
            title: item.label,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
