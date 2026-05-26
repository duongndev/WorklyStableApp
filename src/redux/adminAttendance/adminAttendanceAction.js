import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAllAttendanceApi, getDetailAttendanceApi } from '../../api/attendance.api';

export const getAllAttendanceAction = createAsyncThunk(
  'adminAttendance/getAllAttendance',
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await getAllAttendanceApi(query);
      if (response && response.success) {
        return {
          message: response.message,
          data: response.data?.attendanceList || [],
          pagination: response.pagination
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải danh sách chấm công' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải danh sách chấm công');
    }
  },
);

export const getDetailAttendanceAction = createAsyncThunk(
  'adminAttendance/getDetailAttendance',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getDetailAttendanceApi(id);
      if (response && response.success) {
        return {
          message: response.message,
          data: response.data?.attendance || null,
        };
      } else {
        return rejectWithValue({ message: response.message || 'Không thể tải chi tiết chấm công' });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải chi tiết chấm công');
    }
  },
);
