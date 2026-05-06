import React, { memo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SplashScreen from '../screens/SplashScreen';

// Navigation Components
import BottomTabNavigator from './BottomTabNavigator';
import AdminBottomTabNavigator from './AdminBottomTabNavigator';

// Feature Screens
import LeaveDetailScreen from '../screens/employee/leave/LeaveDetailScreen';
import LeaveHistoryScreen from '../screens/employee/leave/LeaveHistoryScreen';
import OvertimeDetailScreen from '../screens/employee/overtime/OvertimeDetailScreen';
import OvertimeHistoryScreen from '../screens/employee/overtime/OvertimeHistoryScreen';
import OvertimeRequestScreen from '../screens/employee/overtime/OvertimeRequestScreen';
import PayrollScreen from '../screens/employee/payroll/PayrollScreen';
import WorkScheduleScreen from '../screens/employee/schedule/WorkScheduleScreen';
import NotificationScreen from '../screens/notifications/NotificationScreen';
import ProfileScreen from '../screens/employee/profile/ProfileScreen';
import CreateLeaveScreen from '../screens/employee/leave/CreateLeaveScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminLeaveManagementScreen from '../screens/admin/AdminLeaveManagementScreen';
import LeaveRequestsListScreen from '../screens/admin/LeaveRequestsListScreen';
import LeaveRequestDetailScreenAdmin from '../screens/admin/LeaveRequestDetailScreen';
import OvertimeRequestsListScreen from '../screens/admin/OvertimeRequestsListScreen';
import OvertimeRequestDetailScreenAdmin from '../screens/admin/OvertimeRequestDetailScreen';
import AdminOvertimeHistoryScreen from '../screens/admin/OvertimeHistoryScreen';
import AdminOvertimeDashboardScreen from '../screens/admin/OvertimeDashboardScreen';
import AdminOvertimeManagementScreen from '../screens/admin/AdminOvertimeManagementScreen';
import AttendanceHistoryScreenAdmin from '../screens/admin/AttendanceHistoryScreen';
import WorkScheduleScreenAdmin from '../screens/admin/WorkScheduleScreen';
import AdminAttendanceScreen from '../screens/admin/AdminAttendanceScreen';
import AttendanceDetailScreen from '../screens/admin/AttendanceDetailScreen';

const Stack = createNativeStackNavigator();

// Screen configuration for better maintainability
const SCREENS = [
  { name: 'Splash', component: SplashScreen },
  { name: 'Login', component: LoginScreen },
  { name: 'Main', component: BottomTabNavigator },
  { name: 'CreateLeave', component: CreateLeaveScreen },
  { name: 'LeaveDetail', component: LeaveDetailScreen },
  { name: 'LeaveHistory', component: LeaveHistoryScreen },
  { name: 'OvertimeRequest', component: OvertimeRequestScreen },
  { name: 'OvertimeHistory', component: OvertimeHistoryScreen },
  { name: 'OvertimeDetail', component: OvertimeDetailScreen },
  { name: 'WorkSchedule', component: WorkScheduleScreen },
  { name: 'Payroll', component: PayrollScreen },
  { name: 'Notification', component: NotificationScreen },
  { name: 'Profile', component: ProfileScreen },
  
  // Admin Screens
  { name: 'AdminMain', component: AdminBottomTabNavigator },
  { name: 'AdminDashboard', component: AdminDashboardScreen },
  { name: 'AdminLeaveManagement', component: AdminLeaveManagementScreen },
  { name: 'LeaveRequestsList', component: LeaveRequestsListScreen },
  { name: 'LeaveRequestDetail', component: LeaveRequestDetailScreenAdmin },
  { name: 'OvertimeRequestsList', component: OvertimeRequestsListScreen },
  { name: 'OvertimeRequestDetail', component: OvertimeRequestDetailScreenAdmin },
  { name: 'AdminOvertimeManagement', component: AdminOvertimeManagementScreen },
  { name: 'AdminOvertimeHistory', component: AdminOvertimeHistoryScreen },
  { name: 'AdminOvertimeDashboard', component: AdminOvertimeDashboardScreen },
  { name: 'AttendanceHistory', component: AttendanceHistoryScreenAdmin },
  { name: 'AdminWorkSchedule', component: WorkScheduleScreenAdmin },
  { name: 'AdminAttendance', component: AdminAttendanceScreen },
  { name: 'AttendanceDetail', component: AttendanceDetailScreen },
];

const AppNavigator = memo(() => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        {SCREENS.map(({ name, component }) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default AppNavigator;
