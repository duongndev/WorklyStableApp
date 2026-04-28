import { axiosClient } from "./api.service";


/**
 * =========================
 * ADMIN OVERTIME REQUESTS
 * =========================
 */

/**
 * Lấy danh sách tất cả đơn làm thêm giờ (cho admin)
 */
export const getAllOvertimeRequestsApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/overtime-requests/all', { params });
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
    const response = await axiosClient.put(`/admin/overtime-requests/${id}/status`, { status, note });
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
 * =========================
 * EMPLOYEE OVERTIME REQUESTS
 * =========================
 */