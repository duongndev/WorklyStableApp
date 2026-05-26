import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StatCard from '../../../components/common/StatCard';
import MenuItem from '../../../components/common/MenuItem';
import { getAdminDashboardStatsApi } from '../../../api/admin.api';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState({
    users: { total: 0, employees: 0, admins: 0, managers: 0, active: 0 },
    attendance: { checkedIn: 0, late: 0, absent: 0 },
    leaves: { pending: 0, approved: 0, rejected: 0, thisMonth: 0 },
    overtime: { pending: 0, approved: 0, rejected: 0, totalHoursThisMonth: 0 },
    notifications: { total: 0, unread: 0, thisWeek: 0 },
  });

  const fetchDashboardStats = useCallback(async () => {
    try {
      setError(null);
      const response = await getAdminDashboardStatsApi();
      if (response.success && response.data) {
        const data = response.data;
        setStats({
          users: {
            total: data.users?.total || 0,
            employees: data.users?.employees || 0,
            admins: data.users?.admins || 0,
            managers: data.users?.managers || 0,
            active: data.users?.active || 0,
          },
          attendance: {
            checkedIn: data.attendance?.checkedIn || 0,
            late: data.attendance?.late || 0,
            absent: data.attendance?.absent || 0,
          },
          leaves: {
            pending: data.leaves?.pending || 0,
            approved: data.leaves?.approved || 0,
            rejected: data.leaves?.rejected || 0,
            thisMonth: data.leaves?.thisMonth || 0,
          },
          overtime: {
            pending: data.overtime?.pending || 0,
            approved: data.overtime?.approved || 0,
            rejected: data.overtime?.rejected || 0,
            totalHoursThisMonth: data.overtime?.totalHoursThisMonth || 0,
          },
          notifications: {
            total: data.notifications?.total || 0,
            unread: data.notifications?.unread || 0,
            thisWeek: data.notifications?.thisWeek || 0,
          },
        });
      }
    } catch (err) {
      console.log('Error fetching dashboard stats:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      // Fallback data for demo
      setStats({
        users: { total: 25, employees: 20, admins: 2, managers: 3, active: 23 },
        attendance: { checkedIn: 23, late: 1, absent: 2 },
        leaves: { pending: 3, approved: 15, rejected: 2, thisMonth: 18 },
        overtime: { pending: 2, approved: 10, rejected: 1, totalHoursThisMonth: 45 },
        notifications: { total: 50, unread: 5, thisWeek: 12 },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  }, [fetchDashboardStats]);


  const menuItems = [
    {
      id: 1,
      title: 'Đơn xin nghỉ phép',
      icon: 'event-busy',
      color: '#EF4444',
      count: stats.leaves.pending,
      screen: 'AdminLeaveManagement',
    },
    {
      id: 2,
      title: 'Đơn làm thêm giờ',
      icon: 'access-time',
      color: '#F59E0B',
      count: stats.overtime.pending,
      screen: 'AdminOvertimeManagement',
    },
    {
      id: 3,
      title: 'Quản lý chấm công',
      icon: 'fingerprint',
      color: '#10B981',
      count: stats.attendance.late + stats.attendance.absent,
      screen: 'AdminAttendance',
    },
    {
      id: 4,
      title: 'Lịch sử chấm công',
      icon: 'history',
      color: '#06B6D4',
      count: null,
      screen: 'AdminAttendanceScreen',
    },
    {
      id: 5,
      title: 'Lịch biểu làm việc',
      icon: 'calendar-today',
      color: '#3B82F6',
      count: null,
      screen: 'AdminWorkSchedule',
    },
  ];

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['bottom']}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  // Error state with retry
  if (error && stats.totalEmployees === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['bottom']}>
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardStats}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Dashboard Admin</Text>
            <Text style={styles.headerSubtitle}>Quản lý hệ thống Workly</Text>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Icon name="warning" size={20} color="#F59E0B" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Thống kê nhanh</Text>
          <View style={styles.statsRow}>
            <StatCard
              title="Nhân viên"
              value={stats.users.employees}
              icon="account-group"
              color="#8B5CF6"
            />
            <StatCard
              title="Đã check-in"
              value={stats.attendance.checkedIn}
              icon="account-check"
              color="#06B6D4"
            />
          </View>
          <View style={[styles.statsRow, { marginTop: 12 }]}>
            <StatCard
              title="Đi muộn"
              value={stats.attendance.late}
              icon="alarm"
              color="#F59E0B"
            />
            <StatCard
              title="Vắng mặt"
              value={stats.attendance.absent}
              icon="account-off"
              color="#EF4444"
            />
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quản lý yêu cầu</Text>
          {menuItems.map((item) => (
            <MenuItem 
              key={item.id} 
              {...item} 
              onPress={() => navigation.navigate(item.screen)}
            />
          ))}
        </View>

      </ScrollView>
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
    color: '#EF4444',
    textAlign: 'center',
    marginHorizontal: 32,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 60) / 3,
    height: 80,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
