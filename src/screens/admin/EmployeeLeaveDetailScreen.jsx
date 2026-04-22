import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import StatusFilter from '../../components/common/StatusFilter';
import { useStatusFilter } from '../../hooks/useStatusFilter';
import { LEAVE_STATUS_FILTERS } from '../../utils/filterConfigs';
import { STATUS_CONFIG } from '../../utils/statusConfigs';
import { LEAVE_TYPE_CONFIG } from '../../utils/leaveTypeConfigs';
import {
  getEmployeeLeaveRequestsAction,
  approveLeaveRequestAction,
  rejectLeaveRequestAction,
  clearError,
  resetSelectedEmployee,
} from '../../redux/adminLeave/adminLeaveAction';
import RejectModal from '../../components/admin/RejectModal';

const EmployeeLeaveDetailScreen = ({ route, navigation }) => {
  const { employeeId } = route.params;
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');

  const {
    selectedEmployee,
    employeeLeaveRequests,
    employeeStats,
    loadingEmployee,
    error,
    message,
    employeePagination,
  } = useSelector((state) => state.adminLeave);

  // Fetch employee data
  const fetchEmployeeData = useCallback(
    async (query = {}) => {
      const result = await dispatch(
        getEmployeeLeaveRequestsAction({
          employeeId,
          query: { page: 1, limit: 10, ...query },
        })
      );
      return result;
    },
    [dispatch, employeeId]
  );

  // Initial load
  useEffect(() => {
    fetchEmployeeData();
    return () => {
      dispatch(resetSelectedEmployee());
      dispatch(clearError());
    };
  }, [fetchEmployeeData, dispatch]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEmployeeData();
    setRefreshing(false);
  }, [fetchEmployeeData]);

  // Use status filter
  const {
    selectedFilter,
    filters,
    filteredData: filteredRequests,
    handleFilterSelect,
  } = useStatusFilter(LEAVE_STATUS_FILTERS, employeeLeaveRequests, 'status');

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get leave type config
  const getLeaveTypeConfig = (leaveType) => {
    return LEAVE_TYPE_CONFIG[leaveType] || {
      label: 'Nghỉ phép',
      color: '#3B82F6',
      icon: 'calendar-star',
    };
  };

  // Get status config
  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  // Handle approve
  const handleApprove = (request) => {
    Alert.alert(
      'Xác nhận duyệt',
      `Bạn có chắc chắn muốn duyệt đơn xin nghỉ này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          style: 'default',
          onPress: async () => {
            const id = request._id || request.id;
            const result = await dispatch(approveLeaveRequestAction(id));
            if (approveLeaveRequestAction.fulfilled.match(result)) {
              Alert.alert('Thành công', 'Đơn xin nghỉ đã được duyệt');
            }
          },
        },
      ]
    );
  };

  // Handle reject
  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  // Confirm reject
  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    const id = selectedRequest._id || selectedRequest.id;
    const result = await dispatch(rejectLeaveRequestAction({ id, reason: rejectReason }));

    if (rejectLeaveRequestAction.fulfilled.match(result)) {
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      Alert.alert('Thành công', 'Đơn xin nghỉ đã bị từ chối');
    }
  };

  // Render employee info card
  const renderEmployeeCard = () => {
    if (!selectedEmployee) return null;

    return (
      <View style={styles.employeeCard}>
        <View style={styles.employeeHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(selectedEmployee.fullName || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{selectedEmployee.fullName || 'Không xác định'}</Text>
            <Text style={styles.employeeMeta}>
              {selectedEmployee.department || 'N/A'} • {selectedEmployee.position || 'N/A'}
            </Text>
            {selectedEmployee.email && (
              <Text style={styles.employeeEmail}>{selectedEmployee.email}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Render stats card
  const renderStatsCard = () => {
    if (!employeeStats) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Thống kê yêu cầu nghỉ phép</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="access-time" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{employeeStats.pending || 0}</Text>
            <Text style={styles.statLabel}>Chờ duyệt</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="check-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{employeeStats.approved || 0}</Text>
            <Text style={styles.statLabel}>Đã duyệt</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="cancel" size={20} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{employeeStats.rejected || 0}</Text>
            <Text style={styles.statLabel}>Đã từ chối</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
              <Icon name="summarize" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.statValue}>
              {(employeeStats.pending || 0) + (employeeStats.approved || 0) + (employeeStats.rejected || 0)}
            </Text>
            <Text style={styles.statLabel}>Tổng</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render leave request item
  const renderLeaveItem = ({ item }) => {
    const leaveTypeConfig = getLeaveTypeConfig(item.leaveType);
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={styles.leaveItem}
        onPress={() => navigation.navigate('LeaveRequestDetail', { requestId: item._id || item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.leaveHeader}>
          <View style={styles.leaveTypeContainer}>
            <View style={[styles.leaveTypeIcon, { backgroundColor: leaveTypeConfig.color }]}>
              <MaterialCommunityIcons name={leaveTypeConfig.icon} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.leaveTypeText}>{leaveTypeConfig.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={styles.leaveBody}>
          <View style={styles.leaveInfoRow}>
            <Icon name="date-range" size={16} color="#6B7280" />
            <Text style={styles.leaveInfoText}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>
          <View style={styles.leaveInfoRow}>
            <Icon name="timelapse" size={16} color="#6B7280" />
            <Text style={styles.leaveInfoText}>{item.duration} ngày</Text>
          </View>
          {item.reason && (
            <View style={styles.leaveInfoRow}>
              <Icon name="description" size={16} color="#6B7280" />
              <Text style={styles.leaveReasonText} numberOfLines={2}>
                {item.reason}
              </Text>
            </View>
          )}
        </View>

        {item.status === 'pending' && (
          <View style={styles.leaveActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(item)}
            >
              <Icon name="check" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Duyệt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item)}
            >
              <Icon name="close" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loadingEmployee && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['bottom']}>
        <Header title="Chi tiết nhân viên" canGoBack />
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Chi tiết nhân viên" canGoBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Employee Info */}
        {renderEmployeeCard()}

        {/* Stats */}
        {renderStatsCard()}

        {/* Leave Requests Section */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Danh sách yêu cầu nghỉ phép</Text>

          {/* Status Filter */}
          <StatusFilter
            filters={filters}
            selectedFilter={selectedFilter}
            onSelectFilter={handleFilterSelect}
          />

          {/* Leave Requests List */}
          <View style={styles.leaveList}>
            {filteredRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="event-busy" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>Không có yêu cầu nghỉ phép nào</Text>
              </View>
            ) : (
              filteredRequests.map((item) => (
                <View key={item._id || item.id}>
                  {renderLeaveItem({ item })}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Reject Modal */}
      <RejectModal
        visible={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedRequest(null);
        }}
        onConfirm={confirmReject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        title="Từ chối đơn xin nghỉ"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  employeeInfo: {
    marginLeft: 16,
    flex: 1,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  employeeMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  employeeEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  requestsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  leaveList: {
    marginTop: 8,
  },
  leaveItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  leaveTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaveBody: {
    marginBottom: 12,
  },
  leaveInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  leaveInfoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  leaveReasonText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  leaveActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default EmployeeLeaveDetailScreen;
