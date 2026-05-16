import { createSlice } from '@reduxjs/toolkit';
import {
  getAllLeaveRequestsAction,
  getEmployeeLeaveRequestsAction,
  getLeaveHistoryAction,
  getLeaveDashboardAction,
  getAllLeaveBalancesAction,
  updateLeaveRequestStatusAction,
} from './adminLeaveAction';

const initialState = {
  // Danh sách tất cả yêu cầu nghỉ phép
  leaveRequests: [],
  
  // Thông tin nhân viên và yêu cầu nghỉ phép cụ thể
  selectedEmployee: null,
  employeeLeaveRequests: [],
  employeeStats: null,
  
  // Lịch sử nghỉ phép
  leaveHistory: [],
  leaveHistorySummary: null,
  departmentStats: [],
  
  // Dashboard
  dashboard: {
    year: null,
    overallStats: null,
    departmentStats: [],
    monthlyTrends: [],
    leaveTypeStats: [],
    recentActivity: []
  },
  
  // Số dư nghỉ phép
  leaveBalances: [],
  leaveBalanceSummary: null,
  
  // Loading states
  loading: false,
  loadingEmployee: false,
  loadingHistory: false,
  loadingDashboard: false,
  loadingBalances: false,
  processingLeave: false,
  
  // Error và message
  error: null,
  message: '',
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    itemsPerPage: 10
  },
  employeePagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    itemsPerPage: 10
  },
  historyPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  }
};

const adminLeaveSlice = createSlice({
  name: 'adminLeave',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = '';
    },
    resetSelectedEmployee: (state) => {
      state.selectedEmployee = null;
      state.employeeLeaveRequests = [];
      state.employeeStats = null;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setEmployeePage: (state, action) => {
      state.employeePagination.currentPage = action.payload;
    },
    setHistoryPage: (state, action) => {
      state.historyPagination.currentPage = action.payload;
    },
    resetLeaveRequests: (state) => {
      state.leaveRequests = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        itemsPerPage: 10
      };
    }
  },
  extraReducers: (builder) => {
    // 1. Get all leave requests
    builder
      .addCase(getAllLeaveRequestsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLeaveRequestsAction.fulfilled, (state, action) => {
        state.loading = false;
        const { page } = action.payload.pagination || {};
        const newData = action.payload.data || [];
        
        if (page === 1) {
          state.leaveRequests = newData;
        } else {
          const existingIds = new Set(state.leaveRequests.map(item => item._id || item.id));
          const uniqueNewItems = newData.filter(item => !existingIds.has(item._id || item.id));
          state.leaveRequests = [...state.leaveRequests, ...uniqueNewItems];
        }
        
        state.pagination = action.payload.pagination || state.pagination;
        state.message = action.payload.message;
      })
      .addCase(getAllLeaveRequestsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Đã xảy ra lỗi';
      });

    // 2. Get employee leave requests
    builder
      .addCase(getEmployeeLeaveRequestsAction.pending, (state) => {
        state.loadingEmployee = true;
        state.error = null;
      })
      .addCase(getEmployeeLeaveRequestsAction.fulfilled, (state, action) => {
        state.loadingEmployee = false;
        state.selectedEmployee = action.payload.employee;
        state.employeeLeaveRequests = action.payload.leaveRequests || [];
        state.employeeStats = action.payload.stats;
        state.employeePagination = action.payload.pagination || state.employeePagination;
        state.message = action.payload.message;
      })
      .addCase(getEmployeeLeaveRequestsAction.rejected, (state, action) => {
        state.loadingEmployee = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Đã xảy ra lỗi';
      });

    // 3. Get leave history
    builder
      .addCase(getLeaveHistoryAction.pending, (state) => {
        state.loadingHistory = true;
        state.error = null;
      })
      .addCase(getLeaveHistoryAction.fulfilled, (state, action) => {
        state.loadingHistory = false;
        state.leaveHistory = action.payload.leaveRequests || [];
        state.leaveHistorySummary = action.payload.summary;
        state.departmentStats = action.payload.departmentStats || [];
        state.historyPagination = action.payload.pagination || state.historyPagination;
        state.message = action.payload.message;
      })
      .addCase(getLeaveHistoryAction.rejected, (state, action) => {
        state.loadingHistory = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Đã xảy ra lỗi';
      });

    // 4. Get leave dashboard
    builder
      .addCase(getLeaveDashboardAction.pending, (state) => {
        state.loadingDashboard = true;
        state.error = null;
      })
      .addCase(getLeaveDashboardAction.fulfilled, (state, action) => {
        state.loadingDashboard = false;
        state.dashboard = {
          year: action.payload.year,
          overallStats: action.payload.overallStats,
          departmentStats: action.payload.departmentStats,
          monthlyTrends: action.payload.monthlyTrends,
          leaveTypeStats: action.payload.leaveTypeStats,
          recentActivity: action.payload.recentActivity
        };
        state.message = action.payload.message;
      })
      .addCase(getLeaveDashboardAction.rejected, (state, action) => {
        state.loadingDashboard = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Đã xảy ra lỗi';
      });

    // 5. Get all leave balances
    builder
      .addCase(getAllLeaveBalancesAction.pending, (state) => {
        state.loadingBalances = true;
        state.error = null;
      })
      .addCase(getAllLeaveBalancesAction.fulfilled, (state, action) => {
        state.loadingBalances = false;
        state.leaveBalances = action.payload.employees || [];
        state.leaveBalanceSummary = action.payload.summary;
        state.message = action.payload.message;
      })
      .addCase(getAllLeaveBalancesAction.rejected, (state, action) => {
        state.loadingBalances = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Đã xảy ra lỗi';
      });

    // Update leave request status (Approve/Reject)
    builder
      .addCase(updateLeaveRequestStatusAction.pending, (state) => {
        state.processingLeave = true;
        state.error = null;
      })
      .addCase(updateLeaveRequestStatusAction.fulfilled, (state, action) => {
        state.processingLeave = false;
        state.message = action.payload.message;
        // Cập nhật trạng thái trong danh sách
        const updatedLeave = action.payload.leaveRequest;
        const newStatus = action.payload.status;
        const statusColor = newStatus === 'approved' ? 'green' : 'red';
        
        if (updatedLeave) {
          state.leaveRequests = state.leaveRequests.map(leave => 
            (leave._id || leave.id) === (updatedLeave._id || updatedLeave.id) 
              ? { ...leave, status: newStatus } 
              : leave
          );
          state.employeeLeaveRequests = state.employeeLeaveRequests.map(leave => 
            (leave._id || leave.id) === (updatedLeave._id || updatedLeave.id) 
              ? { ...leave, status: newStatus } 
              : leave
          );
          state.leaveHistory = state.leaveHistory.map(leave => 
            (leave._id || leave.id) === (updatedLeave._id || updatedLeave.id) 
              ? { ...leave, status: newStatus, statusColor } 
              : leave
          );
        }
      })
      .addCase(updateLeaveRequestStatusAction.rejected, (state, action) => {
        state.processingLeave = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Đã xảy ra lỗi';
      });
  },
});

export const { 
  clearError, 
  clearMessage, 
  resetSelectedEmployee, 
  setPage, 
  setEmployeePage, 
  setHistoryPage,
  resetLeaveRequests 
} = adminLeaveSlice.actions;

export default adminLeaveSlice.reducer;
