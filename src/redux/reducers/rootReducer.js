import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import leaveReducer from '../leave/leaveSlice';
// import overtimeReducer from './overtime/overtimeSlice';
// import scheduleReducer from './schedule/scheduleSlice';
// import employeeReducer from './employee/employeeSlice';
// import notificationReducer from './notification/notifiSlice';
// import attendanceReducer from './attendance/attendanceSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  leave: leaveReducer,
  // overtime: overtimeReducer,
  // schedule: scheduleReducer,
  // employee: employeeReducer,
  // notification: notificationReducer,
  // attendance: attendanceReducer,
});

export default rootReducer;
