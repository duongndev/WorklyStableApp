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
import AdminRequestCard from '../../../components/admin/AdminRequestCard';
import RejectModal from '../../../components/admin/RejectModal';
import { getAllOvertimeRequestsApi, approveOvertimeRequestApi, rejectOvertimeRequestApi } from '../../../api/admin.api';

const OvertimeRequestsListScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [overtimeRequests, setOvertimeRequests] = useState([]);

  // Fallback data for demo
  const fallbackData = [
    {
      id: 1,
      employeeName: 'Nguyễn Văn A',
      employeeId: 'NV001',
      department: 'Kỹ thuật',
      date: '2024-03-20',
      startTime: '18:00',
      endTime: '22:00',
      totalHours: 4,
      reason: 'Hoàn thành dự án khách hàng gấp, cần thêm thời gian để hoàn thành features còn thiếu',
      status: 'pending',
      createdAt: '2024-03-18T14:30:00',
    },
    {
      id: 2,
      employeeName: 'Trần Thị B',
      employeeId: 'NV002',
      department: 'Nhân sự',
      date: '2024-03-19',
      startTime: '17:30',
      endTime: '20:30',
      totalHours: 3,
      reason: 'Xử lý báo cáo tháng 3 và chuẩn bị tài liệu cho cuộc họp board',
      status: 'approved',
      approvedBy: 'Admin',
      approvedAt: '2024-03-18T16:20:00',
    },
    {
      id: 3,
      employeeName: 'Lê Văn C',
      employeeId: 'NV003',
      department: 'Kinh doanh',
      date: '2024-03-18',
      startTime: '17:00',
      endTime: '21:00',
      totalHours: 4,
      reason: 'Gặp gỡ khách hàng quan trọng sau giờ làm việc',
      status: 'rejected',
      rejectedBy: 'Admin',
      rejectedReason: 'Không có thông báo trước và không được cấp trên duyệt',
      rejectedAt: '2024-03-17T18:45:00',
    },
  ];

  const fetchOvertimeRequests = useCallback(async () => {
    try {
      setError(null);
      const response = await getAllOvertimeRequestsApi();
      if (response.success) {
        setOvertimeRequests(response.data || []);
      } else {
        setOvertimeRequests(fallbackData);
      }
    } catch (err) {
      console.log('Error fetching overtime requests:', err);
      setError('Không thể tải dữ liệu. Hiển thị dữ liệu mẫu.');
      setOvertimeRequests(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOvertimeRequests();
  }, [fetchOvertimeRequests]);

  const filters = [
    { key: 'all', label: 'Tất cả', count: overtimeRequests.length },
    { key: 'pending', label: 'Chờ duyệt', count: overtimeRequests.filter(r => r.status === 'pending').length },
    { key: 'approved', label: 'Đã duyệt', count: overtimeRequests.filter(r => r.status === 'approved').length },
    { key: 'rejected', label: 'Đã từ chối', count: overtimeRequests.filter(r => r.status === 'rejected').length },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOvertimeRequests();
    setRefreshing(false);
  }, [fetchOvertimeRequests]);

  const filteredRequests = overtimeRequests.filter(request => {
    const matchesFilter = selectedFilter === 'all' || request.status === selectedFilter;
    const matchesSearch = request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      'Bạn có chắc chắn muốn duyệt đơn làm thêm giờ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          onPress: async () => {
            try {
              await approveOvertimeRequestApi(requestId);
              setOvertimeRequests(prev => prev.map(req =>
                req.id === requestId
                  ? { ...req, status: 'approved', approvedBy: 'Admin', approvedAt: new Date().toISOString() }
                  : req
              ));
              Alert.alert('Thành công', 'Đơn làm thêm giờ đã được duyệt');
            } catch (err) {
              console.log('Error approving overtime request:', err);
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
      await rejectOvertimeRequestApi(selectedRequest.id, rejectReason);
      setOvertimeRequests(prev => prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'rejected', rejectedBy: 'Admin', rejectedReason: rejectReason, rejectedAt: new Date().toISOString() }
          : req
      ));
      
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      Alert.alert('Thành công', 'Đơn làm thêm giờ đã bị từ chối');
    } catch (err) {
      console.log('Error rejecting overtime request:', err);
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
      <Header title="Đơn làm thêm giờ" canGoBack />
      
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
        onSelectFilter={setSelectedFilter}
      />

      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <AdminRequestCard
            item={item}
            onPress={() => navigation.navigate('OvertimeRequestDetail', { requestId: item.id })}
            onApprove={() => handleApprove(item.id)}
            onReject={() => handleReject(item)}
            details={[
              { icon: 'event', text: item.date },
              { icon: 'access-time', text: `${item.startTime} - ${item.endTime} (${item.totalHours} giờ)` },
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
            <Icon name="access-time" size={64} color="#E5E7EB" />
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
        title="Từ chối đơn làm thêm giờ"
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

export default OvertimeRequestsListScreen;
