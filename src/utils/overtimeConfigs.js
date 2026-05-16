// Overtime type configurations
export const OVERTIME_TYPE_CONFIG = {
  regular: {
    label: 'Bình thường',
    color: '#3B82F6',
    icon: 'schedule',
  },
  weekend: {
    label: 'Cuối tuần',
    color: '#8B5CF6',
    icon: 'weekend',
  },
  holiday: {
    label: 'Ngày lễ',
    color: '#F59E0B',
    icon: 'celebration',
  },
  emergency: {
    label: 'Khẩn cấp',
    color: '#EF4444',
    icon: 'warning',
  },
};

// Status color mapping
export const STATUS_COLORS = {
  pending: {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    text: 'Chờ duyệt',
  },
  approved: {
    color: '#10B981',
    bgColor: '#D1FAE5',
    text: 'Đã duyệt',
  },
  rejected: {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    text: 'Đã từ chối',
  },
  cancelled: {
    color: '#6B7280',
    bgColor: '#F3F4F6',
    text: 'Đã hủy',
  },
};

// Get overtime type display
export const getOvertimeTypeDisplay = (type) => {
  return OVERTIME_TYPE_CONFIG[type]?.label || type || 'Không xác định';
};

// Get overtime type color
export const getOvertimeTypeColor = (type) => {
  return OVERTIME_TYPE_CONFIG[type]?.color || '#6B7280';
};

// Get overtime type icon
export const getOvertimeTypeIcon = (type) => {
  return OVERTIME_TYPE_CONFIG[type]?.icon || 'schedule';
};

// Get status display
export const getStatusDisplay = (status) => {
  return STATUS_COLORS[status]?.text || status || 'Không xác định';
};

// Get status color
export const getStatusColor = (status) => {
  return STATUS_COLORS[status]?.color || '#6B7280';
};

// Get status background color
export const getStatusBgColor = (status) => {
  return STATUS_COLORS[status]?.bgColor || '#F3F4F6';
};

// Format hours display
export const formatHoursDisplay = (hours) => {
  if (hours === undefined || hours === null) return '0 giờ';
  return `${hours} giờ`;
};

// Overtime status filters for UI
export const OVERTIME_STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
  { key: 'cancelled', label: 'Đã hủy' },
];

// Overtime type filters for UI
export const OVERTIME_TYPE_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'regular', label: 'Bình thường' },
  { key: 'weekend', label: 'Cuối tuần' },
  { key: 'holiday', label: 'Ngày lễ' },
  { key: 'emergency', label: 'Khẩn cấp' },
];
