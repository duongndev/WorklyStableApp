import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import LeaveRequestModal from '../../../components/employee/requests/LeaveRequestModal';
import Header from '../../../components/common/Header';
import { useSelector, useDispatch } from 'react-redux';
import { getLeaveDetailAction, deleteLeaveRequestAction } from '../../../redux/leave/leaveAction';
import { resetLeaveDetail } from '../../../redux/leave/leaveSlice';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';

const STATUS_CONFIG = {
  pending: { 
    label: 'Chờ duyệt', 
    color: '#F59E0B', 
    bg: 'rgba(245, 158, 11, 0.1)', 
    icon: 'clock-outline',
    description: 'Đang chờ quản lý phê duyệt'
  },
  approved: { 
    label: 'Đã duyệt', 
    color: '#10B981', 
    bg: 'rgba(16, 185, 129, 0.1)', 
    icon: 'check-circle-outline',
    description: 'Yêu cầu đã được phê duyệt'
  },
  rejected: { 
    label: 'Từ chối', 
    color: '#EF4444', 
    bg: 'rgba(239, 68, 68, 0.1)', 
    icon: 'close-circle-outline',
    description: 'Yêu cầu đã bị từ chối'
  },
};

const LEAVE_TYPE_CONFIG = {
  maternity_leave: { label: 'Nghỉ thai sản', icon: 'baby-face-outline', color: '#EC4899' },
  annual_leave: { label: 'Nghỉ phép năm', icon: 'beach', color: '#3B82F6' },
  sick_leave: { label: 'Nghỉ ốm', icon: 'medical-bag', color: '#EF4444' },
  unpaid_leave: { label: 'Nghỉ không lương', icon: 'currency-usd-off', color: '#6B7280' },
  personal_leave: { label: 'Nghỉ cá nhân', icon: 'account', color: '#8B5CF6' },
  default: { label: 'Nghỉ phép', icon: 'calendar-minus', color: '#3B82F6' },
};

const LeaveDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { colors } = theme;
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  
  // Get data from params and Redux state
  const { item: initialItem, onUpdate } = route.params || {};
  const { leaveDetail, loadingDetail } = useSelector((state) => state.leave);
  const [item, setItem] = useState(initialItem);

  // Fetch leave detail with error handling
  const fetchLeaveDetail = useCallback(async () => {
    if (!initialItem?._id) return;
    
    try {
      setError(null);
      await dispatch(getLeaveDetailAction(initialItem._id)).unwrap();
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin đơn nghỉ');
      console.error('Error fetching leave detail:', err);
    }
  }, [initialItem?._id, dispatch]);

  // Fetch leave detail when component mounts or ID changes
  useEffect(() => {
    fetchLeaveDetail();
    
    // Cleanup function to reset detail when unmounting
    return () => {
      dispatch(resetLeaveDetail());
    };
  }, [fetchLeaveDetail, dispatch]);

  // Update local item when Redux state changes
  useEffect(() => {
    if (leaveDetail && Object.keys(leaveDetail).length > 0) {
      setItem(leaveDetail);
    }
  }, [leaveDetail]);

  // Fallback to initial item if API call fails
  useEffect(() => {
    if (!loadingDetail && !leaveDetail && initialItem) {
      setItem(initialItem);
    }
  }, [loadingDetail, leaveDetail, initialItem]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaveDetail();
    setRefreshing(false);
  }, [fetchLeaveDetail]);

  // Handle cancel request with confirmation
  const handleConfirmCancel = useCallback(async () => {
    if (!item?._id) return;
    
    setIsDeleting(true);
    
    try {
      const result = await dispatch(deleteLeaveRequestAction(item._id));
      
      if (deleteLeaveRequestAction.fulfilled.match(result)) {
        // Successfully deleted, navigate back
        if (onUpdate) {
          onUpdate(); // Notify parent screen to refresh
        }
        navigation.goBack();
      } else {
        // Handle error
        const errorMessage = result.payload?.message || 'Không thể hủy yêu cầu';
        Alert.alert('Lỗi', errorMessage);
      }
    } catch (deleteError) {
      console.error('Error deleting leave request:', deleteError);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi hủy yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  }, [item?._id, dispatch, onUpdate, navigation]);

  const handleCancelRequest = useCallback(() => {
    Alert.alert(
      'Xác nhận hủy yêu cầu',
      'Bạn có chắc chắn muốn hủy yêu cầu nghỉ phép này? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Có, hủy yêu cầu',
          style: 'destructive',
          onPress: handleConfirmCancel,
        },
      ],
      { cancelable: true }
    );
  }, [handleConfirmCancel]);

  // Memoized status and leave type configs
  const status = useMemo(() => {
    if (!item) return STATUS_CONFIG.pending;
    return STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
  }, [item]);

  const leaveType = useMemo(() => {
    if (!item) return LEAVE_TYPE_CONFIG.default;
    return LEAVE_TYPE_CONFIG[item.leaveType] || LEAVE_TYPE_CONFIG.default;
  }, [item]);

  // Memoized formatted dates
  const formattedDates = useMemo(() => {
    if (!item) return {};
    
    return {
      createdAt: new Date(item.createdAt).toLocaleString('vi-VN'),
      createdDate: new Date(item.createdAt).toLocaleDateString('vi-VN'),
      startDate: new Date(item.startDate).toLocaleDateString('vi-VN'),
      endDate: new Date(item.endDate).toLocaleDateString('vi-VN'),
      approvedAt: item.approvedAt ? new Date(item.approvedAt).toLocaleString('vi-VN') : null,
    };
  }, [item]);

  const InfoRow = useCallback(({ icon, label, value, valueColor, isLoading = false }) => (
    <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.infoRow}>
      <View style={[styles.infoIconContainer, { backgroundColor: colors.card }]}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <MaterialCommunityIcons name={icon} size={20} color={colors.subText} />
        )}
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.subText }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: valueColor || colors.text }]}>
          {isLoading ? 'Đang tải...' : value}
        </Text>
      </View>
    </Animated.View>
  ), [colors]);

  // Error state
  if (error && !loadingDetail) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <Header
          title="Chi tiết đơn nghỉ"
          canGoBack
        />
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Lỗi tải dữ liệu</Text>
          <Text style={[styles.errorMessage, { color: colors.subText }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (!item && loadingDetail) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <Header
          title="Chi tiết đơn nghỉ"
          canGoBack
        />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.subText }]}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not found state
  if (!item && !loadingDetail) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <Header
          title="Chi tiết đơn nghỉ"
          canGoBack
        />
        <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
          <MaterialCommunityIcons name="file-document-outline" size={64} color={colors.subText} />
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>Không tìm thấy thông tin</Text>
          <Text style={[styles.notFoundMessage, { color: colors.subText }]}>Đơn nghỉ không tồn tại hoặc đã bị xóa</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Header
        title="Chi tiết đơn nghỉ"
        canGoBack
      />

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        
        {/* Status Banner */}
        <Animated.View entering={FadeIn.duration(500)}>
          <View style={[styles.statusBanner, { backgroundColor: loadingDetail ? colors.card : status.bg }]}>
            {loadingDetail ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialCommunityIcons name={status.icon} size={32} color={status.color} />
            )}
            <View style={styles.statusContent}>
              <Text style={[styles.statusTitle, { color: loadingDetail ? colors.text : status.color }]}>
                {loadingDetail ? 'Đang tải...' : status.label}
              </Text>
              <Text style={[styles.statusSubtitle, { color: loadingDetail ? colors.subText : status.color }, loadingDetail ? styles.opacityFull : styles.opacitySemi]}>
                {loadingDetail ? 'Vui lòng đợi' : 
                 item.status === 'pending' ? status.description :
                 item.status === 'approved' ? `Đã được duyệt bởi ${item.approvedBy?.fullName || 'Quản lý'}` : 
                 status.description}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Main Info Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.typeIcon, { backgroundColor: leaveType.color }]}>
                {loadingDetail ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <MaterialCommunityIcons name={leaveType.icon} size={24} color="#FFF" />
                )}
              </View>
              <View style={styles.typeInfo}>
                <Text style={[styles.typeTitle, { color: colors.text }]}>
                  {loadingDetail ? 'Đang tải loại nghỉ...' : leaveType.label}
                </Text>
                <Text style={[styles.createdDate, { color: colors.subText }]}>
                  {loadingDetail ? 'Đang tải...' : `Tạo ngày ${formattedDates.createdDate}`}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <InfoRow 
                icon="account-outline" 
                label="Người gửi" 
                value={loadingDetail ? 'Đang tải...' : item.userId?.fullName || 'Tôi'} 
                isLoading={loadingDetail}
              />

              <InfoRow 
                icon="domain" 
                label="Phòng ban" 
                value={loadingDetail ? 'Đang tải...' : item.userId?.department || 'Chưa cập nhật'} 
                isLoading={loadingDetail}
              />

              <InfoRow 
                icon="briefcase-outline" 
                label="Vị trí" 
                value={loadingDetail ? 'Đang tải...' : item.userId?.position || 'Chưa cập nhật'} 
                isLoading={loadingDetail}
              />

              <InfoRow 
                icon="clock-time-four-outline" 
                label="Thời gian gửi" 
                value={loadingDetail ? 'Đang tải...' : formattedDates.createdAt} 
                isLoading={loadingDetail}
              />

              <InfoRow 
                icon="calendar-range" 
                label="Thời gian nghỉ" 
                value={loadingDetail ? 'Đang tải...' : `${formattedDates.startDate} - ${formattedDates.endDate} (${item.duration} ngày)`} 
                isLoading={loadingDetail}
              />
              
              {!loadingDetail && item.leaveDurationType === 'time_based' && (
                <Animated.View entering={FadeInDown.delay(300).duration(300)}>
                  <InfoRow 
                    icon="clock-outline" 
                    label="Giờ nghỉ" 
                    value={`${item.startTime} - ${item.endTime}`} 
                  />
                </Animated.View>
              )}

              <InfoRow 
                icon="text-box-outline" 
                label="Lý do" 
                value={loadingDetail ? 'Đang tải...' : item.reason || "Không có lý do"} 
                isLoading={loadingDetail}
              />

              <InfoRow 
                icon="cash-outline" 
                label="Loại nghỉ phép" 
                value={loadingDetail ? 'Đang tải...' : item.isPaidLeave ? 'Nghỉ có lương' : 'Nghỉ không lương'} 
                isLoading={loadingDetail}
              />

              {!loadingDetail && (item.status === 'approved' || item.status === 'rejected') && (
                <Animated.View entering={FadeInDown.delay(400).duration(300)}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin phê duyệt</Text>
                  
                  <InfoRow 
                    icon="account-check-outline" 
                    label="Người phê duyệt" 
                    value={item.approvedBy?.fullName || 'Quản lý'} 
                  />

                  <InfoRow 
                    icon="clock-check-outline" 
                    label="Thời gian duyệt" 
                    value={formattedDates.approvedAt || 'Chưa cập nhật'} 
                  />
                </Animated.View>
              )}

              {!loadingDetail && item.status === 'rejected' && (
                <Animated.View entering={FadeInDown.delay(500).duration(300)}>
                  <InfoRow 
                    icon="alert-circle-outline" 
                    label="Lý do từ chối" 
                    value={item.rejectReason || "Không có lý do cụ thể"} 
                    valueColor={colors.error}
                  />
                </Animated.View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons (Only for pending) */}
        {!loadingDetail && item.status === 'pending' && (
          <Animated.View entering={SlideInRight.delay(600).duration(400)} style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
              disabled={isDeleting}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: colors.error }, isDeleting && styles.disabledOpacity]}
              onPress={handleCancelRequest}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <MaterialCommunityIcons name="close" size={20} color={colors.error} />
              )}
              <Text style={[styles.cancelButtonText, { color: colors.error }]}>
                {isDeleting ? 'Đang hủy...' : 'Hủy yêu cầu'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

      </ScrollView>

      <LeaveRequestModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(updatedItem) => {
          setItem(updatedItem); // Update local state
          if (onUpdate) onUpdate(updatedItem); // Notify parent screen
        }}
        initialData={item}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  opacityFull: {
    opacity: 1,
  },
  opacitySemi: {
    opacity: 0.8,
  },
  disabledOpacity: {
    opacity: 0.6,
  },
  content: {
    padding: 20,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    marginBottom: 20,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statusSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  createdDate: {
    fontSize: 13,
  },
  cardBody: {
    padding: 20,
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 4,
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    borderStyle: 'solid',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  editButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    borderStyle: 'solid',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LeaveDetailScreen;
