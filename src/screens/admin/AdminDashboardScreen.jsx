import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import StatCard from '../../components/common/StatCard';
import MenuItem from '../../components/common/MenuItem';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState({
    pendingLeaveRequests: 0,
    pendingOvertimeRequests: 0,
    totalEmployees: 0,
    todayAttendance: 0,
  });

  const onRefresh = async () => {

  };


  const menuItems = [
    {
      id: 1,
      title: 'Đơn xin nghỉ phép',
      icon: 'event-busy',
      color: '#EF4444',
      count: stats.pendingLeaveRequests,
      screen: 'LeaveRequestsList',
    },
    {
      id: 2,
      title: 'Đơn làm thêm giờ',
      icon: 'access-time',
      color: '#F59E0B',
      count: stats.pendingOvertimeRequests,
      screen: 'OvertimeRequestsList',
    },
    {
      id: 3,
      title: 'Lịch sử chấm công',
      icon: 'history',
      color: '#10B981',
      count: null,
      screen: 'AttendanceHistory',
    },
    {
      id: 4,
      title: 'Lịch biểu làm việc',
      icon: 'calendar-today',
      color: '#3B82F6',
      count: null,
      screen: 'AdminWorkSchedule',
    },
  ];

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
              value={stats.totalEmployees}
              icon="account-group"
              color="#8B5CF6"
            />
            <StatCard
              title="Chấm công hôm nay"
              value={stats.todayAttendance}
              icon="account-check"
              color="#06B6D4"
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

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#FEE2E2' }]}
              onPress={() => navigation.navigate('LeaveRequestsList')}
              activeOpacity={0.8}
            >
              <Icon name="event-busy" size={20} color="#EF4444" />
              <Text style={styles.quickActionText}>Nghỉ phép</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#FEF3C7' }]}
              onPress={() => navigation.navigate('OvertimeRequestsList')}
              activeOpacity={0.8}
            >
              <Icon name="access-time" size={20} color="#F59E0B" />
              <Text style={styles.quickActionText}>Làm thêm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#DBEAFE' }]}
              onPress={() => navigation.navigate('AdminWorkSchedule')}
              activeOpacity={0.8}
            >
              <Icon name="calendar-today" size={20} color="#3B82F6" />
              <Text style={styles.quickActionText}>Lịch làm</Text>
            </TouchableOpacity>
          </View>
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
