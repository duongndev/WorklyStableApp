import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import LeaveRequestsTab from '../../components/admin/leave/LeaveRequestsTab';
import LeaveDashboardTab from '../../components/admin/leave/LeaveDashboardTab';
import LeaveHistoryTab from '../../components/admin/leave/LeaveHistoryTab';
import LeaveBalanceTab from '../../components/admin/leave/LeaveBalanceTab';
import {
  getAllLeaveRequestsAction,
  getLeaveDashboardAction,
  getLeaveHistoryAction,
  getAllLeaveBalancesAction,
  clearError,
  clearMessage,
} from '../../redux/adminLeave/adminLeaveAction';

const { width } = Dimensions.get('window');

const TABS = [
  { key: 'requests', label: 'Yêu cầu', icon: 'list-alt' },
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'history', label: 'Lịch sử', icon: 'history' },
  { key: 'balance', label: 'Số dư', icon: 'account-balance' },
];

const AdminLeaveManagementScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('requests');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const {
    leaveRequests,
    loading,
    loadingDashboard,
    loadingHistory,
    loadingBalances,
    dashboard,
    leaveHistory,
    leaveBalances,
    pagination,
    error,
    message,
  } = useSelector((state) => state.adminLeave);

  // Fetch data based on active tab
  const fetchData = useCallback(async (tab = activeTab) => {
    switch (tab) {
      case 'requests':
        await dispatch(getAllLeaveRequestsAction({ page: 1, limit: 10 }));
        break;
      case 'dashboard':
        await dispatch(getLeaveDashboardAction({ year: selectedYear }));
        break;
      case 'history':
        await dispatch(getLeaveHistoryAction({ page: 1, limit: 10, year: selectedYear }));
        break;
      case 'balance':
        await dispatch(getAllLeaveBalancesAction({ year: selectedYear }));
        break;
      default:
        break;
    }
  }, [activeTab, selectedYear, dispatch]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Clear messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    fetchData(tabKey);
  };

  // Render tab button
  const renderTabButton = (tab) => {
    const isActive = activeTab === tab.key;
    return (
      <TouchableOpacity
        key={tab.key}
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => handleTabChange(tab.key)}
        activeOpacity={0.8}
      >
        <Icon
          name={tab.icon}
          size={20}
          color={isActive ? '#4F46E5' : '#6B7280'}
        />
        <Text
          style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    const isLoading =
      (activeTab === 'requests' && loading) ||
      (activeTab === 'dashboard' && loadingDashboard) ||
      (activeTab === 'history' && loadingHistory) ||
      (activeTab === 'balance' && loadingBalances);

    if (isLoading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'requests':
        return (
          <LeaveRequestsTab
            leaveRequests={leaveRequests}
            pagination={pagination}
            onRefresh={onRefresh}
            refreshing={refreshing}
            navigation={navigation}
          />
        );
      case 'dashboard':
        return (
          <LeaveDashboardTab
            dashboard={dashboard}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        );
      case 'history':
        return (
          <LeaveHistoryTab
            leaveHistory={leaveHistory}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onRefresh={onRefresh}
            refreshing={refreshing}
            navigation={navigation}
          />
        );
      case 'balance':
        return (
          <LeaveBalanceTab
            leaveBalances={leaveBalances}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onRefresh={onRefresh}
            refreshing={refreshing}
            navigation={navigation}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Quản lý nghỉ phép" canGoBack />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {TABS.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Icon name="error-outline" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error.message || error}</Text>
          <TouchableOpacity onPress={() => dispatch(clearError())}>
            <Icon name="close" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Success Message */}
      {message && (
        <View style={styles.successBanner}>
          <Icon name="check-circle" size={20} color="#10B981" />
          <Text style={styles.successText}>{message}</Text>
          <TouchableOpacity onPress={() => dispatch(clearMessage())}>
            <Icon name="close" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
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
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
});

export default AdminLeaveManagementScreen;
