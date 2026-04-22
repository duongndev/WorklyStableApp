import { axiosClient } from "./api.service";

export const getMyLeavesRequestApi = async (query = {}) => {
  try {
    const response = await axiosClient.get('/leave-request/myleave', { params: query });
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy danh sách đơn xin nghỉ:', error);
    throw error;
  }
};

export const getLeaveStatisticsApi = async () => {
  try {
    const response = await axiosClient.get('/leave-request/statistics');
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy thống kê đơn xin nghỉ:', error);
    throw error;
  }
};

export const getDetailLeavesRequestApi = async (id) => {
  try {
    const response = await axiosClient.get(`/leave-request/${id}`);
    return response.data;
  } catch (error) {
    console.log('Lỗi khi lấy chi tiết đơn xin nghỉ:', error);
    throw error;
  }
};


export const deleteLeaveRequestApi = async (id) => {
  try {
    const response = await axiosClient.delete(`/leave-request/${id}`);
    return response.data;
  } catch (error) {
    console.log('Lỗi khi xóa đơn xin nghỉ:', error);
    throw error;
  }
};