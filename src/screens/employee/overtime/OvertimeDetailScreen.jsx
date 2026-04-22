import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import Header from '../../../components/common/Header';

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: 'clock-outline' },
  approved: { label: 'Đã duyệt', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: 'check-circle-outline' },
  rejected: { label: 'Từ chối', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: 'close-circle-outline' },
};

const OvertimeDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { colors, isDarkMode } = theme;
  
  const { item } = route.params || {};

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Không tìm thấy thông tin.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

  const InfoRow = ({ icon, label, value, valueColor }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.subText} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.subText }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: valueColor || colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Header title="Chi tiết OT" canGoBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <MaterialCommunityIcons name={status.icon} size={32} color={status.color} />
          <View>
            <Text style={[styles.statusTitle, { color: status.color }]}>{status.label}</Text>
            <Text style={[styles.statusSubtitle, { color: status.color, opacity: 0.8 }]}>
              {item.status === 'pending' ? 'Đang chờ quản lý phê duyệt' : 
               item.status === 'approved' ? `Đã được duyệt bởi ${item.approver || 'Quản lý'}` : 
               'Đã bị từ chối'}
            </Text>
          </View>
        </View>

        {/* Main Info Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.typeIcon, { backgroundColor: item.color }]}>
              <MaterialCommunityIcons name={item.icon || 'clock-plus'} size={24} color="#FFF" />
            </View>
            <View>
              <Text style={[styles.typeTitle, { color: colors.text }]}>{item.project}</Text>
              <Text style={[styles.createdDate, { color: colors.subText }]}>Tạo ngày {item.createdAt}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <InfoRow 
              icon="account-outline" 
              label="Người gửi" 
              value={item.sender || 'Tôi'} 
            />

            <InfoRow 
              icon="calendar-clock" 
              label="Thời gian OT" 
              value={`${item.date} (${item.startTime} - ${item.endTime})`} 
            />
            
            <InfoRow 
              icon="clock-fast" 
              label="Tổng giờ" 
              value={`${item.hours} giờ`} 
            />

            <InfoRow 
              icon="text-box-outline" 
              label="Lý do" 
              value={item.reason || "Không có lý do"} 
            />

            {/* Approval Info Section */}
            {(item.status === 'approved' || item.status === 'rejected') && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin phê duyệt</Text>
                
                <InfoRow 
                  icon="account-check-outline" 
                  label="Người phê duyệt" 
                  value={item.approver || 'Quản lý'} 
                />

                <InfoRow 
                  icon="clock-check-outline" 
                  label="Thời gian duyệt" 
                  value={item.approvedAt || 'Chưa cập nhật'} 
                />
              </>
            )}

            {item.status === 'rejected' && (
              <InfoRow 
                icon="alert-circle-outline" 
                label="Lý do từ chối" 
                value={item.rejectReason || "Không có lý do cụ thể"} 
                valueColor={colors.error}
              />
            )}
          </View>
        </View>

        {/* Action Buttons (Only for pending) */}
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.cancelButton, { borderColor: colors.error }]}
            onPress={() => {
              console.log('Cancel request', item.id);
            }}
          >
            <Text style={[styles.cancelButtonText, { color: colors.error }]}>Hủy yêu cầu</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statusSubtitle: {
    fontSize: 13,
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
    alignItems: 'center',
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
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OvertimeDetailScreen;
