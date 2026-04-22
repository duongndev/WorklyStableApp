/**
 * Navigation helper utilities để tránh lặp code navigation logic
 * @file navigationHelpers.js
 * @description Các hàm helper để navigation dựa trên role và params
 */

/**
 * Navigate dựa trên user role
 * @param {Object} navigation - Navigation object từ useNavigation
 * @param {string} userRole - Role của user ('admin' hoặc 'employee')
 * @param {Function} onUnknownRole - Callback khi role không xác định (optional)
 */
export const navigateBasedOnRole = (navigation, userRole, onUnknownRole) => {
  switch (userRole) {
    case 'admin':
      navigation.replace('AdminMain');
      break;
    case 'employee':
      navigation.replace('Main');
      break;
    default:
      console.warn('Unknown user role:', userRole);
      if (onUnknownRole) {
        onUnknownRole(userRole);
      } else {
        // Default behavior
        navigation.replace('Login');
      }
      break;
  }
};

/**
 * Navigate đến detail screen với params
 * @param {Object} navigation - Navigation object
 * @param {string} screenName - Tên screen đích
 * @param {Object} params - Parameters để truyền
 * @param {string} paramKey - Key của parameter chính (default: 'item')
 */
export const navigateToDetail = (
  navigation,
  screenName,
  params,
  paramKey = 'item',
) => {
  navigation.navigate(screenName, {[paramKey]: params});
};

/**
 * Navigate đến leave request detail
 * @param {Object} navigation - Navigation object
 * @param {Object} leaveRequest - Leave request object
 * @param {boolean} isAdmin - Có phải admin screen không
 */
export const navigateToLeaveDetail = (
  navigation,
  leaveRequest,
  isAdmin = false,
) => {
  const screenName = isAdmin ? 'AdminLeaveDetail' : 'LeaveRequestDetail';
  const paramKey = isAdmin ? 'leaveRequest' : 'leaveRequest';
  const paramValue = isAdmin ? leaveRequest : leaveRequest._id;

  navigation.navigate(screenName, {[paramKey]: paramValue});
};

/**
 * Navigate đến overtime request detail
 * @param {Object} navigation - Navigation object
 * @param {Object} overtimeRequest - Overtime request object
 * @param {boolean} isAdmin - Có phải admin screen không
 */
export const navigateToOvertimeDetail = (
  navigation,
  overtimeRequest,
  isAdmin = false,
) => {
  const screenName = isAdmin ? 'AdminDetailOT' : 'OvertimeRequestDetail';
  const paramKey = 'overtimeRequest';

  navigation.navigate(screenName, {[paramKey]: overtimeRequest});
};

/**
 * Navigate với replace (thay thế stack hiện tại)
 * @param {Object} navigation - Navigation object
 * @param {string} screenName - Tên screen đích
 * @param {Object} params - Parameters (optional)
 */
export const navigateReplace = (navigation, screenName, params = {}) => {
  navigation.replace(screenName, params);
};

/**
 * Navigate back với optional fallback
 * @param {Object} navigation - Navigation object
 * @param {string} fallbackScreen - Screen fallback nếu không thể go back
 */
export const navigateBack = (navigation, fallbackScreen = null) => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else if (fallbackScreen) {
    navigation.navigate(fallbackScreen);
  }
};

/**
 * Reset navigation stack và navigate đến screen mới
 * @param {Object} navigation - Navigation object
 * @param {string} screenName - Tên screen đích
 * @param {Object} params - Parameters (optional)
 */
export const resetAndNavigate = (navigation, screenName, params = {}) => {
  navigation.reset({
    index: 0,
    routes: [{name: screenName, params}],
  });
};

/**
 * Navigate đến screen với animation options
 * @param {Object} navigation - Navigation object
 * @param {string} screenName - Tên screen đích
 * @param {Object} params - Parameters (optional)
 * @param {Object} options - Navigation options (optional)
 */
export const navigateWithOptions = (
  navigation,
  screenName,
  params = {},
  options = {},
) => {
  navigation.navigate(screenName, params, options);
};

/**
 * Common navigation patterns cho các feature screens
 */
export const FeatureNavigation = {
  // Employee features
  toAttendance: navigation => navigation.navigate('Attendance'),
  toLeaveRequest: navigation => navigation.navigate('LeaveRequest'),
  toOvertimeRequest: navigation => navigation.navigate('OvertimeRequest'),
  toWorkSchedule: navigation => navigation.navigate('WeeklyScheduleScreen'),
  toProfile: navigation => navigation.navigate('Profile'),
  toNotifications: navigation => navigation.navigate('NotificationScreen'),

  // Admin features
  toAdminLeave: navigation => navigation.navigate('AdminLeaveScreen'),
  toAdminOvertime: navigation => navigation.navigate('AdminOTScreen'),
  toAdminSchedule: navigation =>
    navigation.navigate('AdminCreateScheduleScreen'),

  // Auth flows
  toLogin: navigation => navigateReplace(navigation, 'LoginScreen'),
  toMain: navigation => navigateReplace(navigation, 'MainScreen'),
  toAdmin: navigation => navigateReplace(navigation, 'AdminScreen'),
};

/**
 * Utility để tạo navigation handler functions
 * @param {Object} navigation - Navigation object
 * @returns {Object} - Object chứa các navigation handlers
 */
export const createNavigationHandlers = navigation => {
  return {
    navigateBasedOnRole: (userRole, onUnknownRole) =>
      navigateBasedOnRole(navigation, userRole, onUnknownRole),

    navigateToDetail: (screenName, params, paramKey) =>
      navigateToDetail(navigation, screenName, params, paramKey),

    navigateToLeaveDetail: (leaveRequest, isAdmin) =>
      navigateToLeaveDetail(navigation, leaveRequest, isAdmin),

    navigateToOvertimeDetail: (overtimeRequest, isAdmin) =>
      navigateToOvertimeDetail(navigation, overtimeRequest, isAdmin),

    navigateReplace: (screenName, params) =>
      navigateReplace(navigation, screenName, params),

    navigateBack: fallbackScreen => navigateBack(navigation, fallbackScreen),

    resetAndNavigate: (screenName, params) =>
      resetAndNavigate(navigation, screenName, params),

    // Feature shortcuts
    features: {
      toAttendance: () => FeatureNavigation.toAttendance(navigation),
      toLeaveRequest: () => FeatureNavigation.toLeaveRequest(navigation),
      toOvertimeRequest: () => FeatureNavigation.toOvertimeRequest(navigation),
      toWorkSchedule: () => FeatureNavigation.toWorkSchedule(navigation),
      toProfile: () => FeatureNavigation.toProfile(navigation),
      toNotifications: () => FeatureNavigation.toNotifications(navigation),
      toAdminLeave: () => FeatureNavigation.toAdminLeave(navigation),
      toAdminOvertime: () => FeatureNavigation.toAdminOvertime(navigation),
      toLogin: () => FeatureNavigation.toLogin(navigation),
      toMain: () => FeatureNavigation.toMain(navigation),
      toAdmin: () => FeatureNavigation.toAdmin(navigation),
    },
  };
};

export default {
  navigateBasedOnRole,
  navigateToDetail,
  navigateToLeaveDetail,
  navigateToOvertimeDetail,
  navigateReplace,
  navigateBack,
  resetAndNavigate,
  navigateWithOptions,
  FeatureNavigation,
  createNavigationHandlers,
};
