import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StatusFilter from '../../common/StatusFilter';
import AdminRequestCard from '../AdminRequestCard';
import RejectModal from '../RejectModal';
import { useStatusFilter } from '../../../hooks/useStatusFilter';
import { OVERTIME_STATUS_FILTERS, getOvertimeTypeDisplay, getOvertimeTypeIcon, formatHoursDisplay } from '../../../utils/overtimeConfigs';
import { getEmployeeOvertimeRequestsAction, updateOvertimeRequestStatusAction } from '../../../redux/adminOvertime/adminOvertimeAction';
import { useDispatch } from 'react-redux';

const OvertimeEmployeeTab = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { employeeId } = route.params || {};

  const [employee, setEmployee] = useState(null);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Use the custom hook for status filtering
  const {
    selectedFilter,
    filters,
    filteredData: filteredByStatus,
    handleFilterSelect,
  } = useStatusFilter(OVERTIME_STATUS_FILTERS, overtimeRequests, 'status');

  // Fetch data
  const fetchData = useCallback(async (page = 1, isRefresh = false) => {
    if (!employeeId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else if (page === 1) {
      setLoading(true);
    }

    try {
      const result = await dispatch(getEmployeeOvertimeRequestsAction({
        employeeId,
        page,
        limit: 10,
        status: selectedFilter === 'all' ? undefined : selectedFilter,
      })).unwrap();

      if (result?.data) {
        setEmployee(result.data.employee);
        setStats(result.data.stats || { pending: 0, approved: 0, rejected: 0 });
        setPagination(result.data.pagination || { currentPage: 1, totalPages: 1, total: 0 });

        if (page === 1) {
          setOvertimeRequests(result.data.overtimeRequests || []);
        } else {
          setOvertimeRequests(prev => [...prev, ...(result.data.overtimeRequests || [])]);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', error?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch, employeeId, selectedFilter]);

  // Initial load
  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  // Refresh when filter changes
  useEffect(() => {
    fetchData(1);
  }, [selectedFilter]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchData(1, true);
  }, [fetchData]);

  // Load more
  const loadMore = useCallback(async () => {
    if (pagination.currentPage < pagination.totalPages && !localLoading) {
      setLocalLoading(true);
      await fetchData(pagination.currentPage + 1);
      setLocalLoading(false);
    }
  }, [pagination, localLoading, fetchData]);

  // Apply search filter
  const filteredRequests = filteredByStatus.filter((request) => {
    const overtimeType = getOvertimeTypeDisplay(request.overtimeType).toLowerCase();
    const reason = (request.reason || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      overtimeType.includes(query) ||
      reason.includes(query)
    );
  });

  // Format request data
  const formatRequestData = (request) => {
    const overtimeTypeDisplay = getOvertimeTypeDisplay(request.overtimeType);
    const hoursDisplay = formatHoursDisplay(request.hoursWork);

    return {
      id: request._id || request.id,
      employeeName: employee?.fullName || 'Không xác định',
      employeeId: employee?._id?.slice(-6) || '',
      department: employee?.department || 'Không xác định',
      status: request.status,
      overtimeType: overtimeTypeDisplay,
      otDate: request.otDate,
      hoursWork: request.hoursWork,
      hoursDisplay: hoursDisplay,
      reason: request.reason,
      createdAt: request.createdAt,
    };
  };

  // Handle approve
  const handleApprove = useCallback((request) => {
    setSelectedRequest(request);
    setActionType('approve');
    setActionNote('');
    setShowActionModal(true);
  }, []);

  // Handle reject
  const handleReject = useCallback((request) => {
    setSelectedRequest(request);
    setActionType('reject');
    setActionNote('');
    setShowActionModal(true);
  }, []);

  // Confirm action
  const confirmAction = useCallback(() => {
    if (!selectedRequest) return;

    setLocalLoading(true);
    setShowActionModal(false);

    const status = actionType === 'approve' ? 'approved' : 'rejected';
    const successMessage = actionType === 'approve' ? 'Đã duyệt đơn làm thêm giờ' : 'Đã từ chối đơn làm thêm giờ';

    dispatch(updateOvertimeRequestStatusAction({
      id: selectedRequest._id || selectedRequest.id,
      status,
      note: actionNote
    }))
      .unwrap()
      .then(() => {
        Alert.alert('Thành công', successMessage);
        setActionNote('');
        setSelectedRequest(null);
        setActionType(null);
        fetchData(1, true);
      })
      .catch((error) => {
        Alert.alert('Lỗi', error?.message || 'Không thể thực hiện thao tác');
      })
      .finally(() => {
        setLocalLoading(false);
      });
  }, [dispatch, selectedRequest, actionNote, actionType, fetchData]);

  // Render item
  const renderItem = ({ item }) => {
    const formattedItem = formatRequestData(item);
    const overtimeIcon = getOvertimeTypeIcon(item.overtimeType);

    return (
      <AdminRequestCard
        item={formattedItem}
        onPress={() => navigation.navigate('OvertimeRequestDetail', { requestId: item._id || item.id })}
        onApprove={() => handleApprove(item)}
        onReject={() => handleReject(item)}
        details={[
          { icon: overtimeIcon, text: formattedItem.overtimeType },
          { icon: 'event', text: `Ngày: ${formattedItem.otDate}` },
          { icon: 'schedule', text: `Số giờ: ${formattedItem.hoursDisplay}` },
          { icon: 'description', text: formattedItem.reason, numberOfLines: 2 },
        ]}
      />
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!localLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4F46E5" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Employee Info Card */}
      {employee && (
        <View style={styles.employeeCard}>
          <View style={styles.employeeHeader}>
            <View style={styles.employeeAvatar}>
              <Icon name="person" size={32} color="#4F46E5" />
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>{employee.fullName}</Text>
              <Text style={styles.employeeDetail}>{employee.department} • {employee.position}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.pending || 0}</Text>
              <Text style={styles.statLabel}>Chờ duyệt</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.approved || 0}</Text>
              <Text style={styles.statLabel}>Đã duyệt</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.rejected || 0}</Text>
              <Text style={styles.statLabel}>Đã từ chối</Text>
            </View>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo loại, lý do..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter */}
      <StatusFilter
        filters={filters}
        selectedFilter={selectedFilter}
        onSelectFilter={handleFilterSelect}
      />

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Tổng số: <Text style={styles.statsNumber}>{pagination.total || filteredRequests.length}</Text> yêu cầu
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => (item._id || item.id).toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="access-time" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>Không có yêu cầu làm thêm giờ nào</Text>
            {searchQuery.length > 0 && (
              <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
            )}
          </View>
        }
      />

      {/* Action Modal */}
      <RejectModal
        visible={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setActionNote('');
          setSelectedRequest(null);
          setActionType(null);
        }}
        onConfirm={confirmAction}
        note={actionNote}
        setNote={setActionNote}
        title={actionType === 'approve' ? 'Duyệt đơn làm thêm giờ' : 'Từ chối đơn làm thêm giờ'}
        placeholder={actionType === 'approve' ? 'Nhập ghi chú khi duyệt (không bắt buộc)...' : 'Nhập lý do từ chối...'}
        confirmButtonText={actionType === 'approve' ? 'Duyệt' : 'Từ chối'}
        confirmButtonColor={actionType === 'approve' ? '#10B981' : '#EF4444'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  employeeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  employeeDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsNumber: {
    fontWeight: 'bold',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default OvertimeEmployeeTab;
