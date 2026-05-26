import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

import AdminDashboardScreen from '../screens/admin/dashboard/AdminDashboardScreen';
import LeaveRequestsListScreen from '../screens/admin/leave/LeaveRequestsListScreen';
import OvertimeRequestsListScreen from '../screens/admin/overtime/OvertimeRequestsListScreen';
import ProfileScreen from '../screens/employee/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const ADMIN_TAB_CONFIG = [
  {
    route: 'AdminDashboardTab',
    label: 'Tổng quan',
    activeIcon: 'view-dashboard',
    inActiveIcon: 'view-dashboard-outline',
    component: AdminDashboardScreen,
  },
  {
    route: 'AdminLeaveRequestsTab',
    label: 'Đơn nghỉ',
    activeIcon: 'calendar-check',
    inActiveIcon: 'calendar-check-outline',
    component: LeaveRequestsListScreen,
  },
  {
    route: 'AdminOvertimeRequestsTab',
    label: 'Làm thêm',
    activeIcon: 'clock-check',
    inActiveIcon: 'clock-check-outline',
    component: OvertimeRequestsListScreen,
  },
  {
    route: 'AdminProfileTab',
    label: 'Cá nhân',
    activeIcon: 'account-cog',
    inActiveIcon: 'account-cog-outline',
    component: ProfileScreen,
  },
];

const AdminBottomTabNavigator = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const current =
          ADMIN_TAB_CONFIG.find(tab => tab.route === route.name) || ADMIN_TAB_CONFIG[0];

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
            borderRadius: 20,
            marginStart: 15,
            marginEnd: 15,
            marginBottom: 15,
            backgroundColor: colors.card,
            borderTopWidth: 0,
            elevation: 5,
            shadowColor: colors.shadow,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginBottom: 5,
          },
        };
      }}
    >
      {ADMIN_TAB_CONFIG.map(tab => (
        <Tab.Screen
          key={tab.route}
          name={tab.route}
          component={tab.component}
        />
      ))}
    </Tab.Navigator>
  );
};

export default AdminBottomTabNavigator;
