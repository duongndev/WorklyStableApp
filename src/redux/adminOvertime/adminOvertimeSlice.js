import { createSlice } from '@reduxjs/toolkit';
import {
  getAllOvertimeRequestsAction,
  getEmployeeOvertimeRequestsAction,
  getOvertimeHistoryAction,
  getOvertimeDashboardAction,
  updateOvertimeRequestStatusAction,
} from './adminOvertimeAction';

const initialState = {
  // Overtime requests list
  overtimeRequests: [],
  loading: false,
  error: null,
  message: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
  },

  // Selected employee overtime
  selectedEmployee: null,
  employeeOvertimeRequests: [],
  employeeStats: { pending: 0, approved: 0, rejected: 0 },
  employeePagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
  },
  employeeLoading: false,
  employeeError: null,

  // History
  historyData: {
    overtimeRequests: [],
    summary: null,
    departmentStats: [],
  },
  historyPagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
  },
  historyLoading: false,
  historyError: null,

  // Dashboard
  dashboard: {
    year: 2026,
    overallStats: null,
    departmentStats: [],
    monthlyTrends: [],
    overtimeTypeStats: [],
    topEmployees: [],
    recentActivity: [],
  },
  dashboardLoading: false,
  dashboardError: null,

  // Update status
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
};

const adminOvertimeSlice = createSlice({
  name: 'adminOvertime',
  initialState,
  reducers: {
    // Clear states
    clearError: (state) => {
      state.error = null;
      state.employeeError = null;
      state.historyError = null;
      state.dashboardError = null;
      state.updateError = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },

    // Reset selected employee
    resetSelectedEmployee: (state) => {
      state.selectedEmployee = null;
      state.employeeOvertimeRequests = [];
      state.employeeStats = { pending: 0, approved: 0, rejected: 0 };
      state.employeePagination = {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasNextPage: false,
      };
    },

    // Pagination
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setEmployeePage: (state, action) => {
      state.employeePagination.currentPage = action.payload;
    },
    setHistoryPage: (state, action) => {
      state.historyPagination.currentPage = action.payload;
    },

    // Reset lists
    resetOvertimeRequests: (state) => {
      state.overtimeRequests = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasNextPage: false,
      };
    },
  },
  extraReducers: (builder) => {
    // Get All Overtime Requests
    builder
      .addCase(getAllOvertimeRequestsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOvertimeRequestsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.overtimeRequests = action.payload.data || [];
        state.pagination = action.payload.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
        };
        state.message = action.payload.message;
      })
      .addCase(getAllOvertimeRequestsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể tải danh sách yêu cầu làm thêm giờ';
      });

    // Get Employee Overtime Requests
    builder
      .addCase(getEmployeeOvertimeRequestsAction.pending, (state) => {
        state.employeeLoading = true;
        state.employeeError = null;
      })
      .addCase(getEmployeeOvertimeRequestsAction.fulfilled, (state, action) => {
        state.employeeLoading = false;
        state.selectedEmployee = action.payload.data?.employee || null;
        state.employeeOvertimeRequests = action.payload.data?.overtimeRequests || [];
        state.employeeStats = action.payload.data?.stats || { pending: 0, approved: 0, rejected: 0 };
        state.employeePagination = action.payload.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
        };
        state.message = action.payload.message;
      })
      .addCase(getEmployeeOvertimeRequestsAction.rejected, (state, action) => {
        state.employeeLoading = false;
        state.employeeError = action.payload?.message || 'Không thể tải yêu cầu làm thêm giờ của nhân viên';
      });

    // Get Overtime History
    builder
      .addCase(getOvertimeHistoryAction.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(getOvertimeHistoryAction.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyData = {
          overtimeRequests: action.payload.data?.overtimeRequests || [],
          summary: action.payload.data?.summary || null,
          departmentStats: action.payload.data?.departmentStats || [],
        };
        state.historyPagination = action.payload.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
        };
        state.message = action.payload.message;
      })
      .addCase(getOvertimeHistoryAction.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload?.message || 'Không thể tải lịch sử làm thêm giờ';
      });

    // Get Overtime Dashboard
    builder
      .addCase(getOvertimeDashboardAction.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(getOvertimeDashboardAction.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = {
          year: action.payload.data?.year || new Date().getFullYear(),
          overallStats: action.payload.data?.overallStats || null,
          departmentStats: action.payload.data?.departmentStats || [],
          monthlyTrends: action.payload.data?.monthlyTrends || [],
          overtimeTypeStats: action.payload.data?.overtimeTypeStats || [],
          topEmployees: action.payload.data?.topEmployees || [],
          recentActivity: action.payload.data?.recentActivity || [],
        };
        state.message = action.payload.message;
      })
      .addCase(getOvertimeDashboardAction.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload?.message || 'Không thể tải dashboard thống kê';
      });

    // Update Overtime Request Status
    builder
      .addCase(updateOvertimeRequestStatusAction.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateOvertimeRequestStatusAction.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.message = action.payload.message;
        
        // Update the request in the list
        const updatedRequest = action.payload.overtimeRequest;
        if (updatedRequest) {
          const index = state.overtimeRequests.findIndex(r => r._id === updatedRequest._id || r.id === updatedRequest.id);
          if (index !== -1) {
            state.overtimeRequests[index] = { ...state.overtimeRequests[index], ...updatedRequest };
          }
          
          const historyIndex = state.historyData.overtimeRequests.findIndex(r => r._id === updatedRequest._id || r.id === updatedRequest.id);
          if (historyIndex !== -1) {
            state.historyData.overtimeRequests[historyIndex] = { ...state.historyData.overtimeRequests[historyIndex], ...updatedRequest };
          }
          
          const employeeIndex = state.employeeOvertimeRequests.findIndex(r => r._id === updatedRequest._id || r.id === updatedRequest.id);
          if (employeeIndex !== -1) {
            state.employeeOvertimeRequests[employeeIndex] = { ...state.employeeOvertimeRequests[employeeIndex], ...updatedRequest };
          }
        }
      })
      .addCase(updateOvertimeRequestStatusAction.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload?.message || 'Không thể cập nhật trạng thái';
      });
  },
});

export const {
  clearError,
  clearMessage,
  clearUpdateState,
  resetSelectedEmployee,
  setPage,
  setEmployeePage,
  setHistoryPage,
  resetOvertimeRequests,
} = adminOvertimeSlice.actions;

export default adminOvertimeSlice.reducer;
