import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMyLeavesRequestApi, getLeaveStatisticsApi, getDetailLeavesRequestApi, deleteLeaveRequestApi } from '../../api/leave.api';

export const getMyLeavesRequestAction = createAsyncThunk(
  'leave/getMyLeavesRequestAction',
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await getMyLeavesRequestApi(query);
      if (response && response.data) {
        return {
          message: response.message,
          data: {
            leaves: response.data,
          },
          pagination: response.pagination
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải dữ liệu nghỉ phép. Vui lòng thử lại sau.' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải dữ liệu nghỉ phép. Vui lòng thử lại sau.');
    }
  },
);

export const getLeaveStatisticsAction = createAsyncThunk(
  'leave/getLeaveStatisticsAction',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLeaveStatisticsApi();
      if (response && response.data) {
        return {
          message: response.message,
          statistics: response.data
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải thống kê nghỉ phép. Vui lòng thử lại sau.' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải thống kê nghỉ phép. Vui lòng thử lại sau.');
    }
  },
);

export const getLeaveDetailAction = createAsyncThunk(
  'leave/getLeaveDetailAction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getDetailLeavesRequestApi(id);
      if (response && response.data) {
        return {
          message: response.message,
          leaveDetail: response.data
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải chi tiết đơn nghỉ. Vui lòng thử lại sau.' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải chi tiết đơn nghỉ. Vui lòng thử lại sau.');
    }
  },
);

export const deleteLeaveRequestAction = createAsyncThunk(
  'leave/deleteLeaveRequestAction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteLeaveRequestApi(id);
      if (response && response.data) {
        return {
          message: response.message,
          leaveRequest: response.data
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể xóa đơn nghỉ. Vui lòng thử lại sau.' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi xóa đơn nghỉ. Vui lòng thử lại sau.');
    }
  },
);
