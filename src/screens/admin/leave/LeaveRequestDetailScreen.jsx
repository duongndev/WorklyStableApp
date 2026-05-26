import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/common/Header';
import { getDetailLeavesRequestApi, updateLeaveRequestStatusApi } from '../../../api/leave.api';

const InfoRow = ({ icon, label, value, color = '#4B5563' }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} size={20} color="#6B7280" style={styles.infoIcon} />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, { color }]}>{value}</Text>
  </View>
);

const AttachmentItem = ({ attachment }) => (
  <TouchableOpacity style={styles.attachmentItem} activeOpacity={0.8}>
    <Icon name="picture-as-pdf" size={24} color="#EF4444" />
    <View style={styles.attachmentInfo}>
      <Text style={styles.attachmentName}>{attachment.name}</Text>
      <Text style={styles.attachmentSize}>{attachment.size}</Text>
    </View>
    <Icon name="download" size={20} color="#6B7280" />
  </TouchableOpacity>
);

const LeaveRequestDetailScreen = ({ route, navigation }) => {
  const { requestId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestDetail, setRequestDetail] = useState(null);

  // Fetch leave request detail
  const fetchRequestDetail = useCallback(async () => {
    try {
      setError(null);
      const response = await getDetailLeavesRequestApi(requestId);
      if (response.success) {
        setRequestDetail(response.data);
      } else {
        setError('Không thể tải dữ liệu đơn xin nghỉ');
      }
    } catch (err) {
      console.log('Error fetching leave request detail:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setFetchLoading(false);
    }
  }, [requestId]);

  // Initial load
  useEffect(() => {
    fetchRequestDetail();
  }, [fetchRequestDetail]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequestDetail();
    setRefreshing(false);
  }, [fetchRequestDetail]);

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

  const handleApprove = () => {
    Alert.alert(
      'Xác nhận duyệt',
      'Bạn có chắc chắn muốn duyệt đơn xin nghỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await updateLeaveRequestStatusApi(requestId, { status: 'approved', note: 'Đã duyệt' });
              if (response.success) {
                await fetchRequestDetail();
                Alert.alert('Thành công', 'Đơn xin nghỉ đã được duyệt');
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể duyệt đơn');
              }
            } catch (err) {
              console.log('Error approving leave request:', err);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi duyệt đơn');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setLoading(true);
      const response = await updateLeaveRequestStatusApi(requestId, { status: 'rejected', note: rejectReason });
      if (response.success) {
        await fetchRequestDetail();
        setShowRejectModal(false);
        setRejectReason('');
        Alert.alert('Thành công', 'Đơn xin nghỉ đã bị từ chối');
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể từ chối đơn');
      }
    } catch (err) {
      console.log('Error rejecting leave request:', err);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi từ chối đơn');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (fetchLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['bottom']}>
        <Header title="Chi tiết đơn xin nghỉ" canGoBack />
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !requestDetail) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['bottom']}>
        <Header title="Chi tiết đơn xin nghỉ" canGoBack />
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy đơn xin nghỉ'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRequestDetail}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Chi tiết đơn xin nghỉ" canGoBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(requestDetail.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(requestDetail.status) }]}>
              {getStatusText(requestDetail.status)}
            </Text>
          </View>
          <Text style={styles.requestId}>Mã đơn: #{requestDetail.id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin nhân viên</Text>
          <View style={styles.sectionContent}>
            <InfoRow icon="person" label="Họ tên" value={requestDetail.employeeName} />
            <InfoRow icon="badge" label="Mã NV" value={requestDetail.employeeId} />
            <InfoRow icon="email" label="Email" value={requestDetail.email} />
            <InfoRow icon="phone" label="Điện thoại" value={requestDetail.phone} />
            <InfoRow icon="business" label="Phòng ban" value={requestDetail.department} />
            <InfoRow icon="work" label="Chức vụ" value={requestDetail.position} />
            <InfoRow icon="supervisor-account" label="Quản lý" value={requestDetail.manager} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn xin nghỉ</Text>
          <View style={styles.sectionContent}>
            <InfoRow icon="event-busy" label="Loại nghỉ" value={requestDetail.leaveType} />
            <InfoRow icon="date-range" label="Từ ngày" value={requestDetail.startDate} />
            <InfoRow icon="date-range" label="Đến ngày" value={requestDetail.endDate} />
            <InfoRow icon="schedule" label="Tổng số ngày" value={`${requestDetail.totalDays} ngày`} />
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Lý do:</Text>
              <Text style={styles.reasonText}>{requestDetail.reason}</Text>
            </View>
            <InfoRow icon="access-time" label="Ngày tạo" value={formatDate(requestDetail.createdAt)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số ngày nghỉ còn lại</Text>
          <View style={styles.sectionContent}>
            <InfoRow 
              icon="beach-access" 
              label="Nghỉ phép năm" 
              value={`${requestDetail.leaveBalance.annualLeave - requestDetail.leaveBalance.usedAnnualLeave}/${requestDetail.leaveBalance.annualLeave} ngày`} 
            />
            <InfoRow 
              icon="healing" 
              label="Nghỉ ốm" 
              value={`${requestDetail.leaveBalance.sickLeave - requestDetail.leaveBalance.usedSickLeave}/${requestDetail.leaveBalance.sickLeave} ngày`} 
            />
          </View>
        </View>

        {requestDetail.attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tệp đính kèm</Text>
            <View style={styles.sectionContent}>
              {requestDetail.attachments.map((attachment) => (
                <AttachmentItem key={attachment.id} attachment={attachment} />
              ))}
            </View>
          </View>
        )}

        {(requestDetail.status === 'approved' || requestDetail.status === 'rejected') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử xử lý</Text>
            <View style={styles.sectionContent}>
              {requestDetail.status === 'approved' && (
                <>
                  <InfoRow icon="check-circle" label="Người duyệt" value={requestDetail.approvedBy} color="#10B981" />
                  <InfoRow icon="event-available" label="Thời gian duyệt" value={formatDate(requestDetail.approvedAt)} color="#10B981" />
                </>
              )}
              {requestDetail.status === 'rejected' && (
                <>
                  <InfoRow icon="cancel" label="Người từ chối" value={requestDetail.rejectedBy} color="#EF4444" />
                  <InfoRow icon="event-busy" label="Thời gian từ chối" value={formatDate(requestDetail.rejectedAt)} color="#EF4444" />
                  <View style={styles.reasonContainer}>
                    <Text style={styles.reasonLabel}>Lý do từ chối:</Text>
                    <Text style={styles.reasonText}>{requestDetail.rejectedReason}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {requestDetail.status === 'pending' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Icon name="check" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Duyệt đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Icon name="close" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lý do từ chối</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={confirmReject}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmModalText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestId: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  sectionContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 80,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  reasonContainer: {
    marginTop: 5,
  },
  reasonLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmModalButton: {
    backgroundColor: '#EF4444',
  },
  cancelModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LeaveRequestDetailScreen;
