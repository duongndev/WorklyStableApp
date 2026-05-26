import { createSlice } from '@reduxjs/toolkit';
import { getAllAttendanceAction, getDetailAttendanceAction } from './adminAttendanceAction';

const initialState = {
    attendanceList: [],
    attendanceDetail: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        itemsPerPage: 10
    },
    loading: false,
    error: null,
    message: ''
};

const adminAttendanceSlice = createSlice({
    name: 'adminAttendance',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMessage: (state) => {
            state.message = '';
        },
        setPage: (state, action) => {
            state.pagination.currentPage = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllAttendanceAction.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = '';
            })
            .addCase(getAllAttendanceAction.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceList = action.payload.data || [];
                state.pagination = action.payload.pagination || initialState.pagination;
                state.message = action.payload.message || '';
            })
            .addCase(getAllAttendanceAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Đã xảy ra lỗi khi tải danh sách chấm công';
            })
            .addCase(getDetailAttendanceAction.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = '';
            })
            .addCase(getDetailAttendanceAction.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceDetail = action.payload.data || null;
                state.message = action.payload.message || '';
            })
            .addCase(getDetailAttendanceAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Đã xảy ra lỗi khi tải chi tiết chấm công';
            });
    }
});

export const { clearError, clearMessage, setPage } = adminAttendanceSlice.actions;

export default adminAttendanceSlice.reducer;