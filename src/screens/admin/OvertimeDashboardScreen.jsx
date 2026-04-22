import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import OvertimeDashboardTab from '../../components/admin/overtime/OvertimeDashboardTab';
import { getOvertimeDashboardApi } from '../../api/admin.api';

const OvertimeDashboardScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    overallStats: null,
    departmentStats: [],
    monthlyTrends: [],
    overtimeTypeStats: [],
    topEmployees: [],
    recentActivity: [],
  });
  const [selectedYear, setSelectedYear] = useState(2026);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getOvertimeDashboardApi({
        year: selectedYear,
      });

      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.log('Error fetching overtime dashboard:', error);
      Alert.alert('Lỗi', 'Không thể tải dashboard thống kê');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = useCallback(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  const handleYearChange = useCallback((year) => {
    setSelectedYear(year);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Dashboard làm thêm giờ" canGoBack />
      
      <OvertimeDashboardTab
        dashboard={dashboard}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});

export default OvertimeDashboardScreen;
