import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllOvertimeRequestsApi,
  getEmployeeOvertimeRequestsApi,
  getOvertimeHistoryApi,
  getOvertimeDashboardApi,
  approveOvertimeRequestApi,
  rejectOvertimeRequestApi,
} from '../../api/admin.api';

// Re-export actions from slice
export {
  clearError,
  clearMessage,
  clearUpdateState,
  resetSelectedEmployee,
  setPage,
  setEmployeePage,
  setHistoryPage,
  resetOvertimeRequests,
} from './adminOvertimeSlice';

/**
 * 1. Lấy danh sách tất cả yêu cầu làm thêm giờ
 */
export const getAllOvertimeRequestsAction = createAsyncThunk(
  'adminOvertime/getAllOvertimeRequests',
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await getAllOvertimeRequestsApi(query);
      if (response && response.success) {
        return {
          message: response.message,
          data: response.data?.overtimeList || [],
          pagination: response.pagination
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải danh sách yêu cầu làm thêm giờ' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải danh sách yêu cầu làm thêm giờ');
    }
  },
);

/**
 * 2. Lấy yêu cầu làm thêm giờ của nhân viên cụ thể
 */
export const getEmployeeOvertimeRequestsAction = createAsyncThunk(
  'adminOvertime/getEmployeeOvertimeRequests',
  async ({ employeeId, page = 1, limit = 10, status }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (status && status !== 'all') params.status = status;

      const response = await getEmployeeOvertimeRequestsApi(employeeId, params);
      if (response && response.success) {
        return {
          message: response.message,
          data: {
            employee: response.data?.employee,
            overtimeRequests: response.data?.overtimeRequests || [],
            stats: response.data?.stats,
            pagination: response.data?.pagination
          }
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải yêu cầu làm thêm giờ của nhân viên' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải yêu cầu làm thêm giờ của nhân viên');
    }
  },
);

/**
 * 3. Lịch sử làm thêm giờ chi tiết (Admin)
 */
export const getOvertimeHistoryAction = createAsyncThunk(
  'adminOvertime/getOvertimeHistory',
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await getOvertimeHistoryApi(query);
      if (response && response.success) {
        return {
          message: response.message,
          data: {
            overtimeRequests: response.data?.overtimeRequests || [],
            pagination: response.data?.pagination,
            summary: response.data?.summary,
            departmentStats: response.data?.departmentStats || [],
            filters: response.data?.filters
          }
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải lịch sử làm thêm giờ' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải lịch sử làm thêm giờ');
    }
  },
);

/**
 * 4. Dashboard thống kê làm thêm giờ
 */
export const getOvertimeDashboardAction = createAsyncThunk(
  'adminOvertime/getOvertimeDashboard',
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await getOvertimeDashboardApi(query);
      if (response && response.success) {
        return {
          message: response.message,
          data: {
            year: response.data?.year,
            overallStats: response.data?.overallStats,
            departmentStats: response.data?.departmentStats || [],
            monthlyTrends: response.data?.monthlyTrends || [],
            overtimeTypeStats: response.data?.overtimeTypeStats || [],
            topEmployees: response.data?.topEmployees || [],
            recentActivity: response.data?.recentActivity || []
          }
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải dashboard thống kê làm thêm giờ' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải dashboard thống kê làm thêm giờ');
    }
  },
);

/**
 * Cập nhật trạng thái đơn làm thêm giờ (Duyệt/Từ chối)
 * @param {Object} payload - { id, status, note }
 *   - id: string - ID của đơn làm thêm giờ
 *   - status: string - 'approved' hoặc 'rejected'
 *   - note: string - Lý do (bắt buộc khi từ chối)
 */
export const updateOvertimeRequestStatusAction = createAsyncThunk(
  'adminOvertime/updateOvertimeRequestStatus',
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      let response;
      if (status === 'approved') {
        response = await approveOvertimeRequestApi(id);
      } else {
        response = await rejectOvertimeRequestApi(id, note);
      }

      if (response && response.success) {
        return {
          message: response.message,
          overtimeRequest: response.data,
          status: status
        };
      } else {
        return rejectWithValue({
          message: response.message || `Không thể ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn làm thêm giờ`
        });
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        `Đã xảy ra lỗi khi ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn làm thêm giờ`
      );
    }
  },
);
