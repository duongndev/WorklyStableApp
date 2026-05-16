import { axiosClient } from "./api.service";



/**
 * =========================
 * EMPLOYEE LEAVE REQUESTS
 * =========================
 */

/**
 * Tạo đơn xin nghỉ
 * Endpoint: POST /api/leave-request
 * Body: { startDate, endDate, reason, leaveType, leaveDurationType, workScheduleId, startTime, endTime, session }
 */
export const createLeaveRequestApi = async (data) => {
  try {
    const response = await axiosClient.post('/leave-requests', data);
    return response.data;
  } catch (error) {
    console.log('Lỗi khi tạo đơn xin nghỉ:', error);
    throw error;
  }
};

/**
 * Lấy danh sách đơn xin nghỉ của nhân viên hiện tại
 * Endpoint: GET /api/leave-request/myleave
 * Query params: page, limit, status, leaveType, startDate, endDate
 */
export const getMyLeavesRequestApi = async (query = {}) => {
  try {
    const response = await axiosClient.get('/leave-requests/myleave', { params: query });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy danh sách đơn xin nghỉ:', error);
    throw error;
  }
};

/**
 * Lấy thống kê đơn xin nghỉ của nhân viên
 * Endpoint: GET /api/leave-request/statistics
 */
export const getLeaveStatisticsApi = async () => {
  try {
    const response = await axiosClient.get('/leave-requests/statistics');
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy thống kê đơn xin nghỉ:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn xin nghỉ
 * Endpoint: GET /api/leave-requests/detail/:id
 */
export const getDetailLeavesRequestApi = async (id) => {
  try {
    const response = await axiosClient.get(`/leave-requests/detail/${id}`);
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy chi tiết đơn xin nghỉ:', error);
    throw error;
  }
};

/**
 * Cập nhật đơn xin nghỉ phép
 * Chỉ được phép cập nhật khi đơn chờ duyệt
 * Endpoint: PUT /api/leave-requests/:id
 * Body: { startDate, endDate, reason, leaveType, leaveDurationType, workScheduleId, startTime, endTime, session }
 */
export const updateLeaveRequestApi = async (id, data) => {
  try {
    const response = await axiosClient.put(`/leave-requests/${id}`, data);
    return response.data;
  } catch (error) {
    console.log('Lỗi khi cập nhật đơn xin nghỉ:', error);
    throw error;
  }
};

/**
 * Xóa đơn xin nghỉ
 * Chỉ được xoá khi đơn đang chờ duyệt
 * Endpoint: DELETE /api/leave-request/:id
 */
export const deleteLeaveRequestApi = async (id) => {
  try {
    const response = await axiosClient.delete(`/leave-requests/${id}`);
    return response.data;
  } catch (error) {
    console.log('Lỗi khi xóa đơn xin nghỉ:', error);
    throw error;
  }
};

// admin
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
    const response = await axiosClient.get('/admin/leave-requests/all', { params });
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
    const response = await axiosClient.put(`/admin/leave-requests/${id}/status`, { status, note });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi cập nhật trạng thái đơn xin nghỉ:', error);
    throw error;
  }
};

/**
 * Get detailed leave request with analysis for admin
 * Endpoint: GET /api/admin/leave-requests/detail/:id
 */
export const getLeaveRequestDetailApi = async (id) => {
  try {
    const response = await axiosClient.get(`/admin/leave-requests/detail/${id}`);
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy chi tiết đơn xin nghỉ:', error);
    throw error;
  }
};