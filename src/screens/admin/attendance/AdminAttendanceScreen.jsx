import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/common/Header';
import StatCard from '../../../components/common/StatCard';
import { getAllAttendanceApi } from '../../../api/attendance.api';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllAttendanceAction,
 } from '../../../redux/adminAttendance/adminAttendanceAction';

const statusMeta = {
  all: { label: 'Tất cả', color: '#3b82f6', icon: 'list' },
  present: { label: 'Có mặt', color: '#16a34a', icon: 'check-circle' },
  late: { label: 'Đi muộn', color: '#f59e0b', icon: 'schedule' },
  early_leave: { label: 'Về sớm', color: '#ef4444', icon: 'logout' },
  absent: { label: 'Nghỉ', color: '#64748b', icon: 'person-off' },
};


const AdminAttendanceScreen = () => {
  const navigation = useNavigation();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { colors } = useTheme();

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { adminAttendance } = useSelector((state) => state.adminAttendance);



  const fetchAttendance = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await getAllAttendanceApi();
      const data = response?.data ?? response ?? [];
      setAttendanceData(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError('Không thể tải dữ liệu chấm công. Vui lòng thử lại.');
      console.log('Error fetching attendance data:', fetchError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendance();
  }, [fetchAttendance]);

  const filteredAttendance = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return attendanceData.filter((item) => {
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        item.employeeName,
        item.employeeId,
        item.department,
        item.position,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [attendanceData, searchQuery, selectedStatus]);

  const stats = useMemo(() => {
    const total = attendanceData.length;
    const present = attendanceData.filter((item) => item.status === 'present').length;
    const late = attendanceData.filter((item) => item.status === 'late').length;
    const earlyLeave = attendanceData.filter((item) => item.status === 'early_leave').length;
    const absent = attendanceData.filter((item) => item.status === 'absent').length;

    return {
      total,
      present,
      late,
      earlyLeave,
      absent,
    };
  }, [attendanceData]);

  const renderStatusChip = (key) => {
    const status = statusMeta[key];
    const active = selectedStatus === key;

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.chip,
          {
            backgroundColor: active ? `${status.color}22` : '#f3f4f6',
            borderColor: active ? status.color : 'transparent',
          },
        ]}
        onPress={() => setSelectedStatus(key)}
        activeOpacity={0.8}
      >
        <Icon name={status.icon} size={16} color={active ? status.color : '#475569'} />
        <Text style={[styles.chipText, { color: active ? status.color : '#475569' }]}> {status.label}</Text>
      </TouchableOpacity>
    );
  };

  const renderAttendanceCard = ({ item }) => {
    const status = statusMeta[item.status] ?? statusMeta.all;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => navigation.navigate('AdminAttendanceDetail', { attendanceId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.employeeName}>{item.employeeName}</Text>
            <Text style={styles.employeeMeta}>{item.employeeId} · {item.department}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}> 
            <Icon name={status.icon} size={18} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Vào cửa</Text>
              <Text style={styles.infoValue}>{item.checkIn || '--:--'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Ra cửa</Text>
              <Text style={styles.infoValue}>{item.checkOut || '--:--'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}> 
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Giờ làm</Text>
              <Text style={styles.infoValue}>{Number(item.workHours || 0).toFixed(2)}h</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Tăng ca</Text>
              <Text style={styles.infoValue}>{Number(item.overtimeHours || 0).toFixed(2)}h</Text>
            </View>
          </View>

          <View style={styles.cardFooterRow}>
            <Icon name="location-on" size={16} color="#64748b" />
            <Text style={styles.locationText}>{item.location || 'Chưa xác định'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Text style={styles.emptyEmoji}>📭</Text>
      </View>
      <Text style={styles.emptyTitle}>Không có kết quả</Text>
      <Text style={styles.emptySubtitle}>
        Hãy thử thay đổi bộ lọc hoặc tìm kiếm để xem dữ liệu khác.
      </Text>
    </View>
  );

  if (loading) {
    return (
   <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Header title="Chấm công" canGoBack={true} />
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Đang tải dữ liệu chấm công...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
     <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Header title="Chấm công" canGoBack={true} />

      <FlatList
        data={filteredAttendance}
        keyExtractor={(item) => item.id?.toString() ?? item.employeeId}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        ListHeaderComponent={
          <View style={styles.section}> 
            <View style={styles.panelRow}>
              <StatCard title="Tổng" value={stats.total} icon="account-group" color="#3b82f6" />
              <StatCard title="Có mặt" value={stats.present} icon="check-circle-outline" color="#16a34a" />
            </View>
            <View style={styles.panelRow}>
              <StatCard title="Đi muộn" value={stats.late} icon="schedule" color="#f59e0b" />
              <StatCard title="Nghỉ/Về sớm" value={stats.absent + stats.earlyLeave} icon="calendar-alert" color="#ef4444" />
            </View>

            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#64748b" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Tìm nhân viên, mã NV, phòng ban..."
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
              />
            </View>

            <View style={styles.filterContainer}>
              {Object.keys(statusMeta).map(renderStatusChip)}
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchAttendance} activeOpacity={0.8}>
                  <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={renderEmptyComponent}
        renderItem={renderAttendanceCard}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  panelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0f172a',
    padding: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  employeeMeta: {
    color: '#64748b',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoBlock: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  locationText: {
    color: '#475569',
    fontSize: 13,
    flex: 1,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 250,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#334155',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 18,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    marginBottom: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default AdminAttendanceScreen;
