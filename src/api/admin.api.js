import { axiosClient } from "./api.service";

/**
 * Lấy thống kê tổng quan cho Admin Dashboard
 */
export const getAdminDashboardStatsApi = async () => {
  try {
    const response = await axiosClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy thống kê dashboard:', error);
    throw error;
  }
};

/**
 * 1. Lấy danh sách tất cả yêu cầu nghỉ phép (cho admin)
 * Endpoint: GET /api/admin/leave-requests
 * Query params: page, limit, status, startDate, endDate
 */
export const getAllLeaveRequestsApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/leave-requests', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy danh sách đơn xin nghỉ:', error);
    throw error;
  }
};

/**
 * 2. Lấy yêu cầu nghỉ phép của nhân viên cụ thể
 * Endpoint: GET /api/admin/leave-requests/employees/:employeeId
 * Query params: page, limit, status, leaveType, startDate, endDate
 */
export const getEmployeeLeaveRequestsApi = async (employeeId, params = {}) => {
  try {
    const response = await axiosClient.get(`/admin/leave-requests/employees/${employeeId}`, { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy yêu cầu nghỉ phép của nhân viên:', error);
    throw error;
  }
};

/**
 * 3. Lịch sử nghỉ phép chi tiết (Admin)
 * Endpoint: GET /api/admin/leave-requests/history
 * Query params: page, limit, status, leaveType, year, department, userId, startDate, endDate
 */
export const getLeaveHistoryApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/leave-requests/history', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy lịch sử nghỉ phép:', error);
    throw error;
  }
};

/**
 * 4. Dashboard thống kê nghỉ phép
 * Endpoint: GET /api/admin/leave-requests/dashboard
 * Query params: year, department
 */
export const getLeaveDashboardApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/leave-requests/dashboard', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy dashboard thống kê nghỉ phép:', error);
    throw error;
  }
};

/**
 * 5. Số dư nghỉ phép tất cả nhân viên
 * Endpoint: GET /api/admin/leave-requests/balance
 * Query params: year, department
 */
export const getAllLeaveBalancesApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/leave-requests/balance', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy số dư nghỉ phép của tất cả nhân viên:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái đơn xin nghỉ phép (Duyệt/Từ chối)
 * Endpoint: PUT /api/leave-requests/:id/status
 */
export const updateLeaveRequestStatusApi = async (id, { status, note }) => {
  try {
    const response = await axiosClient.put(`/leave-requests/${id}/status`, { status, note });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi cập nhật trạng thái đơn xin nghỉ:', error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả đơn làm thêm giờ (cho admin)
 */
export const getAllOvertimeRequestsApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/overtime-requests', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy danh sách đơn làm thêm:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái đơn làm thêm giờ (Duyệt/Từ chối)
 * Endpoint: PUT /api/overtime-requests/:id/status
 */
export const updateOvertimeRequestStatusApi = async (id, { status, note }) => {
  try {
    const response = await axiosClient.put(`/overtime-requests/${id}/status`, { status, note });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi cập nhật trạng thái đơn làm thêm:', error);
    throw error;
  }
};

/**
 * Lấy yêu cầu làm thêm giờ của nhân viên cụ thể
 * Endpoint: GET /api/admin/overtime-requests/employee/:employeeId
 * Query params: page, limit, status, overtimeType, startDate, endDate
 */
export const getEmployeeOvertimeRequestsApi = async (employeeId, params = {}) => {
  try {
    const response = await axiosClient.get(`/admin/overtime-requests/employee/${employeeId}`, { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy yêu cầu làm thêm giờ của nhân viên:', error);
    throw error;
  }
};

/**
 * Lịch sử làm thêm giờ chi tiết (Admin)
 * Endpoint: GET /api/admin/overtime-requests/history
 * Query params: page, limit, status, overtimeType, year, department, userId, startDate, endDate
 */
export const getOvertimeHistoryApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/overtime-requests/history', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy lịch sử làm thêm giờ:', error);
    throw error;
  }
};

/**
 * Dashboard thống kê làm thêm giờ
 * Endpoint: GET /api/admin/overtime-requests/dashboard
 * Query params: year, department
 */
export const getOvertimeDashboardApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/overtime-requests/dashboard', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy dashboard thống kê làm thêm giờ:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử chấm công của tất cả nhân viên
 */
export const getAllAttendanceHistoryApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/attendance-history', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy lịch sử chấm công:', error);
    throw error;
  }
};

/**
 * Lấy lịch làm việc của tất cả nhân viên
 */
export const getAllWorkSchedulesApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/work-schedules', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy lịch làm việc:', error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả nhân viên
 */
export const getAllEmployeesApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/employees', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy danh sách nhân viên:', error);
    throw error;
  }
};
