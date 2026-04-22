/**
 * Filter configurations for different screens
 * @file filterConfigs.js
 * @description Predefined filter configurations for reusable components
 */

// Leave and Overtime request filters
export const STATUS_CONFIG = [
  { key: 'all', label: 'Tất cả', count: 0 },
  { key: 'pending', label: 'Chờ duyệt', count: 0 },
  { key: 'approved', label: 'Đã duyệt', count: 0 },
  { key: 'rejected', label: 'Từ chối', count: 0 },
];


// Attendance filters
export const ATTENDANCE_STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả', count: 0 },
  { key: 'present', label: 'Có mặt', count: 0 },
  { key: 'absent', label: 'Vắng mặt', count: 0 },
  { key: 'late', label: 'Đi muộn', count: 0 },
  { key: 'leave', label: 'Nghỉ phép', count: 0 },
];

// Work schedule filters
export const SCHEDULE_FILTERS = [
  { key: 'all', label: 'Tất cả', count: 0 },
  { key: 'today', label: 'Hôm nay', count: 0 },
  { key: 'week', label: 'Tuần này', count: 0 },
  { key: 'month', label: 'Tháng này', count: 0 },
];

// Notification filters
export const NOTIFICATION_FILTERS = [
  { key: 'all', label: 'Tất cả', count: 0 },
  { key: 'unread', label: 'Chưa đọc', count: 0 },
  { key: 'read', label: 'Đã đọc', count: 0 },
];

// Payroll filters
export const PAYROLL_FILTERS = [
  { key: 'all', label: 'Tất cả', count: 0 },
  { key: 'paid', label: 'Đã trả', count: 0 },
  { key: 'unpaid', label: 'Chưa trả', count: 0 },
];

// Date range filters
export const DATE_RANGE_FILTERS = [
  { key: 'all', label: 'Tất cả', count: 0 },
  { key: 'today', label: 'Hôm nay', count: 0 },
  { key: 'yesterday', label: 'Hôm qua', count: 0 },
  { key: 'week', label: 'Tuần này', count: 0 },
  { key: 'month', label: 'Tháng này', count: 0 },
  { key: 'quarter', label: 'Quý này', count: 0 },
  { key: 'year', label: 'Năm nay', count: 0 },
];

/**
 * Update filter counts based on data
 * @param {Array} filters - Filter configuration
 * @param {Array} data - Data array to count
 * @param {string} statusField - Field name to check status
 * @returns {Array} Updated filters with counts
 */
export const updateFilterCounts = (filters, data, statusField = 'status') => {
  return filters.map(filter => {
    if (filter.key === 'all') {
      return { ...filter, count: data.length };
    }
    
    const count = data.filter(item => {
      if (filter.key === 'unread') return !item.read;
      if (filter.key === 'read') return item.read;
      return item[statusField] === filter.key;
    }).length;
    
    return { ...filter, count };
  });
};

/**
 * Filter data based on selected filter
 * @param {Array} data - Data array to filter
 * @param {string} selectedFilter - Selected filter key
 * @param {string} statusField - Field name to check status
 * @returns {Array} Filtered data
 */
export const filterData = (data, selectedFilter, statusField = 'status') => {
  if (selectedFilter === 'all') return data;
  
  return data.filter(item => {
    if (selectedFilter === 'unread') return !item.read;
    if (selectedFilter === 'read') return item.read;
    return item[statusField] === selectedFilter;
  });
};

export default {
  STATUS_CONFIG,
  ATTENDANCE_STATUS_FILTERS,
  SCHEDULE_FILTERS,
  NOTIFICATION_FILTERS,
  PAYROLL_FILTERS,
  DATE_RANGE_FILTERS,
  updateFilterCounts,
  filterData,
};
