import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllLeaveRequestsApi,
  getEmployeeLeaveRequestsApi,
  getLeaveHistoryApi,
  getLeaveDashboardApi,
  getAllLeaveBalancesApi,
  updateLeaveRequestStatusApi,
} from '../../api/admin.api';

// Re-export actions from slice
export { clearError, clearMessage, resetSelectedEmployee, setPage, setEmployeePage, setHistoryPage, resetLeaveRequests } from './adminLeaveSlice';

/**
 * 1. Lấy danh sách tất cả yêu cầu nghỉ phép
 */
export const getAllLeaveRequestsAction = createAsyncThunk(
  'adminLeave/getAllLeaveRequests',
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await getAllLeaveRequestsApi(query);
      if (response && response.success) {
        return {
          message: response.message,
          data: response.data?.leaveList || [],
          pagination: response.pagination
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải danh sách yêu cầu nghỉ phép' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải danh sách yêu cầu nghỉ phép');
    }
  },
);

/**
 * 2. Lấy yêu cầu nghỉ phép của nhân viên cụ thể
 */
export const getEmployeeLeaveRequestsAction = createAsyncThunk(
  'adminLeave/getEmployeeLeaveRequests',
  async ({ employeeId, query = {} }, { rejectWithValue }) => {
    try {
      const response = await getEmployeeLeaveRequestsApi(employeeId, query);
      if (response && response.success) {
        return {
          message: response.message,
          employee: response.data?.employee,
          leaveRequests: response.data?.leaveRequests || [],
          stats: response.data?.stats,
          pagination: response.pagination
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải yêu cầu nghỉ phép của nhân viên' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải yêu cầu nghỉ phép của nhân viên');
    }
  },
);

/**
 * 3. Lịch sử nghỉ phép chi tiết (Admin)
 */
export const getLeaveHistoryAction = createAsyncThunk(
  'adminLeave/getLeaveHistory',
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await getLeaveHistoryApi(query);
      if (response && response.success) {
        return {
          message: response.message,
          leaveRequests: response.data?.leaveRequests || [],
          pagination: response.data?.pagination,
          summary: response.data?.summary,
          departmentStats: response.data?.departmentStats,
          filters: response.data?.filters
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải lịch sử nghỉ phép' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải lịch sử nghỉ phép');
    }
  },
);

/**
 * 4. Dashboard thống kê nghỉ phép
 */
export const getLeaveDashboardAction = createAsyncThunk(
  'adminLeave/getLeaveDashboard',
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await getLeaveDashboardApi(query);
      if (response && response.success) {
        return {
          message: response.message,
          year: response.data?.year,
          overallStats: response.data?.overallStats,
          departmentStats: response.data?.departmentStats || [],
          monthlyTrends: response.data?.monthlyTrends || [],
          leaveTypeStats: response.data?.leaveTypeStats || [],
          recentActivity: response.data?.recentActivity || []
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải dashboard thống kê nghỉ phép' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải dashboard thống kê nghỉ phép');
    }
  },
);

/**
 * 5. Số dư nghỉ phép tất cả nhân viên
 */
export const getAllLeaveBalancesAction = createAsyncThunk(
  'adminLeave/getAllLeaveBalances',
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await getAllLeaveBalancesApi(query);
      if (response && response.success) {
        return {
          message: response.message,
          year: response.data?.year,
          department: response.data?.department,
          employees: response.data?.employees || [],
          summary: response.data?.summary
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải số dư nghỉ phép của nhân viên' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải số dư nghỉ phép');
    }
  },
);

/**
 * Cập nhật trạng thái đơn xin nghỉ phép (Duyệt/Từ chối)
 * @param {Object} payload - { id, status, note }
 *   - id: string - ID của đơn nghỉ phép
 *   - status: string - 'approved' hoặc 'rejected'
 *   - note: string - Lý do (bắt buộc khi từ chối)
 */
export const updateLeaveRequestStatusAction = createAsyncThunk(
  'adminLeave/updateLeaveRequestStatus',
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      const response = await updateLeaveRequestStatusApi(id, { status, note });
      if (response && response.success) {
        return {
          message: response.message,
          leaveRequest: response.data,
          status: status
        };
      } else {
        return rejectWithValue({ 
          message: response.message || `Không thể ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn nghỉ phép` 
        });
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        `Đã xảy ra lỗi khi ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn nghỉ phép`
      );
    }
  },
);
