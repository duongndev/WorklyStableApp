import { createSlice } from "@reduxjs/toolkit";
import { getMyLeavesRequestAction, getLeaveStatisticsAction, getLeaveDetailAction } from "./leaveAction";

const initialState = {
    leavesList: [],
    leaveDetail: {},
    loading: false,
    loadingDetail: false,
    error: null,
    message: '',
    statistics: {
        pending: 0,
        approved: 0,
        rejected: 0
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    }
};

const leaveSlice = createSlice({
    name: 'leave',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMessage: (state) => {
            state.message = '';
        },
        resetLeaveDetail: (state) => {
            state.leaveDetail = {};
        },
        appendLeaves: (state, action) => {
            state.leavesList = [...state.leavesList, ...action.payload];
        },
        resetLeaves: (state) => {
            state.leavesList = [];
        },
    },
    extraReducers: (builder) => {
        // Get my leaves request
        builder
            .addCase(getMyLeavesRequestAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyLeavesRequestAction.fulfilled, (state, action) => {
                state.loading = false;
                const { page } = action.payload.pagination || {};
                const newLeaves = action.payload.data.leaves || [];
                
                if (page === 1) {
                    // First page - replace data
                    state.leavesList = newLeaves;
                } else {
                    // Subsequent pages - append data and remove duplicates
                    const existingIds = new Set(state.leavesList.map(item => item._id || item.id));
                    const uniqueNewLeaves = newLeaves.filter(item => !existingIds.has(item._id || item.id));
                    state.leavesList = [...state.leavesList, ...uniqueNewLeaves];
                }
                
                state.pagination = action.payload.pagination;
                state.message = action.payload.message;
            })
            .addCase(getMyLeavesRequestAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.message = action.payload?.message || 'Đã xảy ra lỗi khi tải dữ liệu nghỉ phép. Vui lòng thử lại sau.';
            })
        // Get leave statistics
        builder
            .addCase(getLeaveStatisticsAction.pending, (state) => {
                // Don't set loading to true for statistics to avoid UI blocking
                state.error = null;
            })
            .addCase(getLeaveStatisticsAction.fulfilled, (state, action) => {
                state.statistics = action.payload.statistics || state.statistics;
                state.message = action.payload.message;
            })
            .addCase(getLeaveStatisticsAction.rejected, (state, action) => {
                state.error = action.payload;
                state.message = action.payload?.message || 'Đã xảy ra lỗi khi tải thống kê nghỉ phép. Vui lòng thử lại sau.';
            })
        // Get leave detail
        builder
            .addCase(getLeaveDetailAction.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(getLeaveDetailAction.fulfilled, (state, action) => {
                state.loadingDetail = false;
                state.leaveDetail = action.payload.leaveDetail;
                state.message = action.payload.message;
            })
            .addCase(getLeaveDetailAction.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload;
                state.message = action.payload?.message || 'Đã xảy ra lỗi khi tải chi tiết đơn nghỉ. Vui lòng thử lại sau.';
            });
    },
});

export const { clearError, clearMessage, resetLeaveDetail, appendLeaves, resetLeaves } = leaveSlice.actions;
export default leaveSlice.reducer;