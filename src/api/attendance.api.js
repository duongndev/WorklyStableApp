import {axiosClient} from '../api/api.service';

/**
 * =========================
 * ADMIN ATTENDANCE
 * =========================
 */

// Get all attendance
export const getAllAttendanceApi = async (params = {}) => {
  try {
    const response = await axiosClient.get('/admin/attendance/all', { params });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy tất cả danh sách chấm công:', error);
    throw error;
  }
};

// Get detail attendance by ID
export const getDetailAttendanceApi = async (id) => {
  try {
    const response = await axiosClient.get(`/admin/attendance/${id}`);
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy chi tiết chấm công:', error);
    throw error;
  }
};
