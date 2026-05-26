import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/common/Header';
import StatusFilter from '../../../components/common/StatusFilter';
import { useStatusFilter } from '../../../hooks/useStatusFilter';
import { LEAVE_STATUS_FILTERS } from '../../../utils/filterConfigs';
import AdminRequestCard from '../../../components/admin/AdminRequestCard';
import RejectModal from '../../../components/admin/RejectModal';
import { getAllLeaveRequestsApi, approveLeaveRequestApi, rejectLeaveRequestApi } from '../../../api/admin.api';

const LeaveRequestsListScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [leaveRequests, setLeaveRequests] = useState([]);

  // Fallback data for demo
  const fallbackData = [
    {
      id: 1,
      employeeName: 'Nguyễn Văn A',
      employeeId: 'NV001',
      department: 'Kỹ thuật',
      leaveType: 'Nghỉ ốm',
      startDate: '2024-03-20',
      endDate: '2024-03-22',
      totalDays: 3,
      reason: 'Sốt cao và cần thời gian nghỉ ngơi',
      status: 'pending',
      createdAt: '2024-03-18T10:30:00',
    },
    {
      id: 2,
      employeeName: 'Trần Thị B',
      employeeId: 'NV002',
      department: 'Nhân sự',
      leaveType: 'Nghỉ phép năm',
      startDate: '2024-03-25',
      endDate: '2024-03-26',
      totalDays: 2,
      reason: 'Gia đình có việc quan trọng',
      status: 'approved',
      approvedBy: 'Admin',
      approvedAt: '2024-03-18T14:20:00',
    },
    {
      id: 3,
      employeeName: 'Lê Văn C',
      employeeId: 'NV003',
      department: 'Kinh doanh',
      leaveType: 'Nghỉ không lương',
      startDate: '2024-03-28',
      endDate: '2024-03-29',
      totalDays: 2,
      reason: 'Cần xử lý việc cá nhân',
      status: 'rejected',
      rejectedBy: 'Admin',
      rejectedReason: 'Không đủ điều kiện nghỉ không lương',
      rejectedAt: '2024-03-17T16:45:00',
    },
  ];

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setError(null);
      const response = await getAllLeaveRequestsApi();
      if (response.success) {
        setLeaveRequests(response.data || []);
      } else {
        setLeaveRequests(fallbackData);
      }
    } catch (err) {
      console.log('Error fetching leave requests:', err);
      setError('Không thể tải dữ liệu. Hiển thị dữ liệu mẫu.');
      setLeaveRequests(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  // Use the custom hook for status filtering
  const {
    selectedFilter,
    filters,
    filteredData: filteredByStatus,
    handleFilterSelect
  } = useStatusFilter(LEAVE_STATUS_FILTERS, leaveRequests, 'status');

  // Apply search filter
  const filteredRequests = filteredByStatus.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaveRequests();
    setRefreshing(false);
  }, [fetchLeaveRequests]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return 'Không xác định';
    }
  };

  const handleApprove = async (requestId) => {
    Alert.alert(
      'Xác nhận duyệt',
      'Bạn có chắc chắn muốn duyệt đơn xin nghỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          onPress: async () => {
            try {
              await approveLeaveRequestApi(requestId);
              setLeaveRequests(prev => prev.map(req =>
                req.id === requestId
                  ? { ...req, status: 'approved', approvedBy: 'Admin', approvedAt: new Date().toISOString() }
                  : req
              ));
              Alert.alert('Thành công', 'Đơn xin nghỉ đã được duyệt');
            } catch (err) {
              console.log('Error approving leave request:', err);
              Alert.alert('Lỗi', 'Không thể duyệt đơn. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await rejectLeaveRequestApi(selectedRequest.id, rejectReason);
      setLeaveRequests(prev => prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'rejected', rejectedBy: 'Admin', rejectedReason: rejectReason, rejectedAt: new Date().toISOString() }
          : req
      ));
      
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      Alert.alert('Thành công', 'Đơn xin nghỉ đã bị từ chối');
    } catch (err) {
      console.log('Error rejecting leave request:', err);
      Alert.alert('Lỗi', 'Không thể từ chối đơn. Vui lòng thử lại.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['bottom']}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Đơn xin nghỉ phép" canGoBack />
      
      {error && (
        <View style={styles.errorBanner}>
          <Icon name="warning" size={20} color="#F59E0B" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhân viên, MSNV, phòng ban..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <StatusFilter
        filters={filters}
        selectedFilter={selectedFilter}
        onSelectFilter={handleFilterSelect}
      />

      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <AdminRequestCard
            item={item}
            onPress={() => navigation.navigate('LeaveRequestDetail', { requestId: item.id })}
            onApprove={() => handleApprove(item.id)}
            onReject={() => handleReject(item)}
            details={[
              { icon: 'event', text: item.leaveType },
              { icon: 'date-range', text: `${item.startDate} → ${item.endDate} (${item.totalDays} ngày)` },
              { icon: 'description', text: item.reason, numberOfLines: 2 },
            ]}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>Không có yêu cầu nào</Text>
          </View>
        }
      />

      <RejectModal
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  errorBannerText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
});

export default LeaveRequestsListScreen;
