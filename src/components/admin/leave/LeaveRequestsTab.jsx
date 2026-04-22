import React, { useState, useCallback } from 'react';
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
import { useDispatch } from 'react-redux';
import StatusFilter from '../../common/StatusFilter';
import AdminRequestCard from '../AdminRequestCard';
import RejectModal from '../RejectModal';
import { useStatusFilter } from '../../../hooks/useStatusFilter';
import { LEAVE_STATUS_FILTERS } from '../../../utils/filterConfigs';
import { LEAVE_TYPE_CONFIG } from '../../../utils/leaveTypeConfigs';
import {
  getAllLeaveRequestsAction,
  updateLeaveRequestStatusAction,
  setPage,
} from '../../../redux/adminLeave/adminLeaveAction';

const LeaveRequestsTab = ({ leaveRequests, pagination, onRefresh, refreshing, navigation }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [localLoading, setLocalLoading] = useState(false);

  // Use the custom hook for status filtering
  const {
    selectedFilter,
    filters,
    filteredData: filteredByStatus,
    handleFilterSelect,
  } = useStatusFilter(LEAVE_STATUS_FILTERS, leaveRequests, 'status');

  // Apply search filter
  const filteredRequests = filteredByStatus.filter((request) => {
    const employeeName = request.userId?.fullName || '';
    const department = request.userId?.department || '';
    const position = request.userId?.position || '';
    const query = searchQuery.toLowerCase();
    return (
      employeeName.toLowerCase().includes(query) ||
      department.toLowerCase().includes(query) ||
      position.toLowerCase().includes(query)
    );
  });

  // Load more data
  const loadMore = useCallback(async () => {
    if (pagination.hasNextPage && !localLoading) {
      setLocalLoading(true);
      const nextPage = pagination.currentPage + 1;
      await dispatch(getAllLeaveRequestsAction({ page: nextPage, limit: 10, status: selectedFilter }));
      dispatch(setPage(nextPage));
      setLocalLoading(false);
    }
  }, [pagination, localLoading, dispatch, selectedFilter]);

  // Format request data for AdminRequestCard
  const formatRequestData = (request) => {
    const leaveTypeConfig = LEAVE_TYPE_CONFIG[request.leaveType] || {
      label: 'Nghỉ phép',
      color: '#3B82F6',
      icon: 'calendar-star',
    };

    return {
      id: request._id || request.id,
      employeeName: request.userId?.fullName || 'Không xác định',
      employeeId: request.userId?._id?.slice(-6) || '',
      department: request.userId?.department || 'Không xác định',
      status: request.status,
      leaveType: leaveTypeConfig.label,
      startDate: request.startDate,
      endDate: request.endDate,
      totalDays: request.duration,
      reason: request.reason,
      createdAt: request.createdAt,
    };
  };

  // Handle approve - mở modal để nhập note
  const handleApprove = useCallback((request) => {
    setSelectedRequest(request);
    setActionType('approve');
    setActionNote('');
    setShowActionModal(true);
  }, []);

  // Handle reject - mở modal để nhập note
  const handleReject = useCallback((request) => {
    setSelectedRequest(request);
    setActionType('reject');
    setActionNote('');
    setShowActionModal(true);
  }, []);

  // Confirm action (approve/reject)
  const confirmAction = useCallback(() => {
    if (!actionNote.trim()) {
      const actionText = actionType === 'approve' ? 'duyệt' : 'từ chối';
      Alert.alert('Lỗi', `Vui lòng nhập ghi chú khi ${actionText}`);
      return;
    }

    if (!selectedRequest) return;

    setLocalLoading(true);
    setShowActionModal(false);
    
    const status = actionType === 'approve' ? 'approved' : 'rejected';
    const successMessage = actionType === 'approve' ? 'Đã duyệt đơn nghỉ phép' : 'Đã từ chối đơn nghỉ phép';
    const errorMessage = actionType === 'approve' ? 'Không thể duyệt đơn nghỉ phép' : 'Không thể từ chối đơn nghỉ phép';
    
    dispatch(updateLeaveRequestStatusAction({ 
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
      })
      .catch((error) => {
        Alert.alert('Lỗi', error?.message || errorMessage);
      })
      .finally(() => {
        setLocalLoading(false);
      });
  }, [dispatch, selectedRequest, actionNote, actionType]);

  // Render item
  const renderItem = ({ item }) => {
    const formattedItem = formatRequestData(item);
    return (
      <AdminRequestCard
        item={formattedItem}
        onPress={() => navigation.navigate('LeaveRequestDetail', { requestId: item._id || item.id })}
        onApprove={() => handleApprove(item)}
        onReject={() => handleReject(item)}
        details={[
          { icon: 'event', text: formattedItem.leaveType },
          { icon: 'date-range', text: `${formattedItem.startDate} → ${formattedItem.endDate} (${formattedItem.totalDays} ngày)` },
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

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhân viên, phòng ban..."
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>Không có yêu cầu nghỉ phép nào</Text>
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
        title={actionType === 'approve' ? 'Duyệt đơn nghỉ phép' : 'Từ chối đơn nghỉ phép'}
        placeholder={actionType === 'approve' ? 'Nhập ghi chú khi duyệt...' : 'Nhập lý do từ chối...'}
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

export default LeaveRequestsTab;
