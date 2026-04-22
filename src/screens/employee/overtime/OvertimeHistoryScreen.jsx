import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import OvertimeRequestSheet from '../../../components/employee/requests/OvertimeRequestSheet';
import RequestCard from '../../../components/common/RequestCard';
import Header from '../../../components/common/Header';
import StatusFilter from '../../../components/common/StatusFilter';
import { useStatusFilter } from '../../../hooks/useStatusFilter';
import { STATUS_CONFIG } from '../../../utils/filterConfigs';

const MOCK_DATA = [
  {
    id: '1',
    project: 'Dự án Mobile App',
    date: '15/02/2026',
    startTime: '17:30',
    endTime: '19:30',
    hours: 2,
    status: 'pending',
    reason: 'Fix bug gấp cho khách hàng',
    createdAt: '15/02/2026',
    createdTime: '16:00',
    sender: 'Nhân viên',
    color: '#3B82F6',
    icon: 'clock-fast',
  },
  {
    id: '2',
    project: 'Bảo trì Server',
    date: '10/02/2026',
    startTime: '18:00',
    endTime: '21:00',
    hours: 3,
    status: 'approved',
    reason: 'Nâng cấp hệ thống định kỳ',
    createdAt: '10/02/2026',
    createdTime: '14:00',
    sender: 'Nhân viên',
    approver: 'Trần Thị B',
    approvedAt: '10/02/2026 15:30',
    color: '#10B981',
    icon: 'server-network',
  },
  {
    id: '3',
    project: 'Họp với đối tác Mỹ',
    date: '05/02/2026',
    startTime: '20:00',
    endTime: '22:00',
    hours: 2,
    status: 'rejected',
    reason: 'Họp online múi giờ khác',
    rejectReason: 'Không cần thiết phải OT, có thể dời lịch',
    createdAt: '05/02/2026',
    createdTime: '10:00',
    sender: 'Nhân viên',
    approver: 'Lê Văn C',
    approvedAt: '05/02/2026 11:00',
    color: '#EF4444',
    icon: 'account-group',
  },
];

const OvertimeHistoryScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors } = theme;
  const [data, setData] = useState(MOCK_DATA);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  // Use the custom hook for status filtering
  const {
    selectedFilter,
    filters,
    filteredData,
    handleFilterSelect,
    filterStats
  } = useStatusFilter(STATUS_CONFIG, data || [], 'status');

  const handleCreateRequest = (newRequest) => {
    // Logic nhận dữ liệu từ màn hình tạo mới (sẽ implement sau)
    const request = {
      id: Math.random().toString(),
      ...newRequest,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      createdTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      sender: 'Nhân viên',
      color: '#3B82F6',
      icon: 'clock-plus',
    };
    setData([request, ...data]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Header title="Lịch sử làm thêm giờ" canGoBack />
      
      <View style={styles.contentWrapper}>

      {/* Filters */}
      <StatusFilter
        filters={filters}
        selectedFilter={selectedFilter}
        onSelectFilter={handleFilterSelect}
      />

      {/* Filter Stats */}
      {filterStats.hasActiveFilter && (
        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: colors.secondaryText }]}>
            Hiển thị {filterStats.activeCount}/{filterStats.total} yêu cầu ({filterStats.percentage}%)
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <RequestCard 
            item={{...item, label: item.project, days: item.hours}}
            onPress={() => navigation.navigate('OvertimeDetail', { item })}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clock-remove-outline" size={60} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.subText }]}>Chưa có yêu cầu OT nào</Text>
          </View>
        }
      />

      {/* FAB to create new request */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => setIsSheetVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
      </TouchableOpacity>

      <OvertimeRequestSheet 
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onSubmit={handleCreateRequest}
      />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  statsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterContainer: {
    marginTop: 15,
    marginBottom: 10,
    height: 45,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 13,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100, // Space for FAB
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  cardBody: {
    padding: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rangeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  reasonText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
});

export default OvertimeHistoryScreen;
