require('react-native-gesture-handler/jestSetup');

const { jest } = require('@jest/globals');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('react-native-calendars', () => ({
  Calendar: 'Calendar',
  LocaleConfig: { locales: {}, defaultLocale: 'en' },
}));

jest.mock('react-native-geolocation-service', () => ({
  requestAuthorization: jest.fn(async () => 'granted'),
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));

jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({})),
  getMessaging: jest.fn(() => ({})),
}));

jest.mock('@react-native-firebase/messaging', () => {
  const unsubscribe = jest.fn();
  const messagingInstance = {};

  return {
    AuthorizationStatus: {
      AUTHORIZED: 1,
      PROVISIONAL: 2,
      DENIED: 0,
    },
    getMessaging: jest.fn(() => messagingInstance),
    getToken: jest.fn(async () => null),
    requestPermission: jest.fn(async () => 1),
    onMessage: jest.fn(() => unsubscribe),
    onNotificationOpenedApp: jest.fn(() => unsubscribe),
    getInitialNotification: jest.fn(async () => null),
  };
});
