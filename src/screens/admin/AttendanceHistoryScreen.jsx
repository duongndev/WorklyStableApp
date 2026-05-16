import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/common/Header';
import { getAllAttendanceHistoryApi } from '../../api/admin.api';

const { width } = Dimensions.get('window');

const AttendanceHistoryScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2024-03');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [attendanceData, setAttendanceData] = useState([]);

  // Fallback data for demo
  const fallbackData = [
    {
      id: 1,
      employeeName: 'Nguyễn Văn A',
      employeeId: 'NV001',
      department: 'Kỹ thuật',
      date: '2024-03-20',
      checkIn: '08:15',
      checkOut: '18:30',
      workHours: 9.25,
      overtimeHours: 1.25,
      status: 'present',
      lateMinutes: 15,
      location: 'Văn phòng chính',
    },
    {
      id: 2,
      employeeName: 'Trần Thị B',
      employeeId: 'NV002',
      department: 'Nhân sự',
      date: '2024-03-20',
      checkIn: '08:00',
      checkOut: '17:30',
      workHours: 8.5,
      overtimeHours: 0,
      status: 'present',
      lateMinutes: 0,
      location: 'Văn phòng chính',
    },
    {
      id: 3,
      employeeName: 'Lê Văn C',
      employeeId: 'NV003',
      department: 'Kinh doanh',
      date: '2024-03-20',
      checkIn: '09:30',
      checkOut: '18:00',
      workHours: 7.5,
      overtimeHours: 0,
      status: 'late',
      lateMinutes: 90,
      location: 'Văn phòng chính',
    },
    {
      id: 4,
      employeeName: 'Phạm Thị D',
      employeeId: 'NV004',
      department: 'Marketing',
      date: '2024-03-20',
      checkIn: null,
      checkOut: null,
      workHours: 0,
      overtimeHours: 0,
      status: 'absent',
      lateMinutes: 0,
      location: null,
      leaveType: 'Nghỉ ốm',
    },
    {
      id: 5,
      employeeName: 'Hoàng Văn E',
      employeeId: 'NV005',
      department: 'Kế toán',
      date: '2024-03-20',
      checkIn: '08:00',
      checkOut: '16:00',
      workHours: 7,
      overtimeHours: 0,
      status: 'early_leave',
      lateMinutes: 0,
      location: 'Văn phòng chính',
    },
  ];

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      setError(null);
      const response = await getAllAttendanceHistoryApi({ month: selectedMonth });
      if (response.success) {
        setAttendanceData(response.data || []);
      } else {
        setAttendanceData(fallbackData);
      }
    } catch (err) {
      console.log('Error fetching attendance history:', err);
      setError('Không thể tải dữ liệu. Hiển thị dữ liệu mẫu.');
      setAttendanceData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  const filters = [
    { key: 'all', label: 'Tất cả', count: attendanceData.length },
    { key: 'present', label: 'Có mặt', count: attendanceData.filter(r => r.status === 'present').length },
    { key: 'late', label: 'Đi muộn', count: attendanceData.filter(r => r.status === 'late').length },
    { key: 'early_leave', label: 'Về sớm', count: attendanceData.filter(r => r.status === 'early_leave').length },
    { key: 'absent', label: 'Nghỉ', count: attendanceData.filter(r => r.status === 'absent').length },
  ];

  const months = [
    '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
    '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAttendanceHistory();
    setRefreshing(false);
  }, [fetchAttendanceHistory]);

  const filteredData = attendanceData.filter(record => {
    const matchesFilter = selectedFilter === 'all' || record.status === selectedFilter;
    const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#10B981';
      case 'late': return '#F59E0B';
      case 'early_leave': return '#3B82F6';
      case 'absent': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Có mặt';
      case 'late': return 'Đi muộn';
      case 'early_leave': return 'Về sớm';
      case 'absent': return 'Nghỉ';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return 'check-circle';
      case 'late': return 'schedule';
      case 'early_leave': return 'logout';
      case 'absent': return 'cancel';
      default: return 'help';
    }
  };

  const calculateStats = () => {
    const total = attendanceData.length;
    const present = attendanceData.filter(r => r.status === 'present').length;
    const late = attendanceData.filter(r => r.status === 'late').length;
    const earlyLeave = attendanceData.filter(r => r.status === 'early_leave').length;
    const absent = attendanceData.filter(r => r.status === 'absent').length;
    
    return { total, present, late, earlyLeave, absent };
  };

  const renderAttendanceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.attendanceCard}
      onPress={() => setSelectedEmployee(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.employeeName}</Text>
          <Text style={styles.employeeId}>{item.employeeId} • {item.department}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Icon name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceDetails}>
        {item.status !== 'absent' ? (
          <>
            <View style={styles.detailRow}>
              <Icon name="login" size={16} color="#6B7280" />
              <Text style={styles.detailText}>Giờ vào: {item.checkIn || '--:--'}</Text>
              {item.lateMinutes > 0 && (
                <Text style={styles.lateText}>({item.lateMinutes} phút muộn)</Text>
              )}
            </View>
            <View style={styles.detailRow}>
              <Icon name="logout" size={16} color="#6B7280" />
              <Text style={styles.detailText}>Giờ ra: {item.checkOut || '--:--'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color="#6B7280" />
              <Text style={styles.detailText}>Làm việc: {item.workHours} giờ</Text>
              {item.overtimeHours > 0 && (
                <Text style={styles.overtimeText}> (+{item.overtimeHours}h tăng ca)</Text>
              )}
            </View>
            {item.location && (
              <View style={styles.detailRow}>
                <Icon name="location-on" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.leaveInfo}>
            <Icon name="event-busy" size={20} color="#EF4444" />
            <Text style={styles.leaveText}>{item.leaveType || 'Nghỉ không lý do'}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, color, icon }) => (
    <View style={[styles.statCard, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const stats = calculateStats();

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
      <Header 
        title="Lịch sử chấm công" 
        canGoBack 
        rightActions={[
          { icon: 'filter-outline', onPress: () => setShowFilterModal(true) }
        ]}
      />
      
      {error && (
        <View style={styles.errorBanner}>
          <Icon name="warning" size={20} color="#F59E0B" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, mã NV, phòng ban..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <StatCard title="Tổng" value={stats.total} color="#6B7280" icon="people" />
        <StatCard title="Có mặt" value={stats.present} color="#10B981" icon="check-circle" />
        <StatCard title="Đi muộn" value={stats.late} color="#F59E0B" icon="schedule" />
        <StatCard title="Nghỉ" value={stats.absent} color="#EF4444" icon="cancel" />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText,
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Không có dữ liệu chấm công</Text>
          </View>
        }
      />

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn tháng</Text>
            <ScrollView style={styles.monthList}>
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthOption,
                    selectedMonth === month && styles.selectedMonthOption,
                  ]}
                  onPress={() => {
                    setSelectedMonth(month);
                    setShowFilterModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.monthOptionText,
                    selectedMonth === month && styles.selectedMonthOptionText,
                  ]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {selectedEmployee && (
        <Modal
          visible={!!selectedEmployee}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedEmployee(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailModalContent}>
              <View style={styles.detailModalHeader}>
                <Text style={styles.detailModalTitle}>Chi tiết chấm công</Text>
                <TouchableOpacity onPress={() => setSelectedEmployee(null)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.detailModalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Thông tin nhân viên</Text>
                  <InfoRow label="Họ tên" value={selectedEmployee.employeeName} />
                  <InfoRow label="Mã NV" value={selectedEmployee.employeeId} />
                  <InfoRow label="Phòng ban" value={selectedEmployee.department} />
                  <InfoRow label="Ngày" value={selectedEmployee.date} />
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Thông tin chấm công</Text>
                  <InfoRow 
                    label="Trạng thái" 
                    value={getStatusText(selectedEmployee.status)} 
                    color={getStatusColor(selectedEmployee.status)}
                  />
                  {selectedEmployee.status !== 'absent' && (
                    <>
                      <InfoRow label="Giờ vào" value={selectedEmployee.checkIn || '--:--'} />
                      <InfoRow label="Giờ ra" value={selectedEmployee.checkOut || '--:--'} />
                      <InfoRow label="Thời gian làm việc" value={`${selectedEmployee.workHours} giờ`} />
                      {selectedEmployee.overtimeHours > 0 && (
                        <InfoRow label="Tăng ca" value={`${selectedEmployee.overtimeHours} giờ`} />
                      )}
                      {selectedEmployee.lateMinutes > 0 && (
                        <InfoRow label="Đi muộn" value={`${selectedEmployee.lateMinutes} phút`} />
                      )}
                      {selectedEmployee.location && (
                        <InfoRow label="Địa điểm" value={selectedEmployee.location} />
                      )}
                    </>
                  )}
                  {selectedEmployee.status === 'absent' && selectedEmployee.leaveType && (
                    <InfoRow label="Lý do nghỉ" value={selectedEmployee.leaveType} />
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, color = '#4B5563' }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, { color }]}>{value}</Text>
  </View>
);

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
  monthSelector: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
  },
  attendanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attendanceDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  lateText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  overtimeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  leaveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leaveText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
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
    maxWidth: 300,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  monthList: {
    maxHeight: 300,
  },
  monthOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedMonthOption: {
    backgroundColor: '#4F46E5',
  },
  monthOptionText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
  },
  selectedMonthOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailModalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 100,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
});

export default AttendanceHistoryScreen;
