import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/common/Header';
import OvertimeHistoryTab from '../../../components/admin/overtime/OvertimeHistoryTab';
import { getOvertimeHistoryApi } from '../../../api/admin.api';

const OvertimeHistoryScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState({
    overtimeRequests: [],
    summary: null,
    departmentStats: [],
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
  });

  const fetchHistory = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      const response = await getOvertimeHistoryApi({
        page,
        limit: 10,
      });

      if (response.success && response.data) {
        const data = response.data;
        
        if (page === 1) {
          setHistoryData({
            overtimeRequests: data.overtimeRequests || [],
            summary: data.summary || null,
            departmentStats: data.departmentStats || [],
          });
        } else {
          setHistoryData(prev => ({
            ...prev,
            overtimeRequests: [...prev.overtimeRequests, ...(data.overtimeRequests || [])],
          }));
        }

        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
        });
      }
    } catch (error) {
      console.log('Error fetching overtime history:', error);
      if (page === 1) {
        Alert.alert('Lỗi', 'Không thể tải lịch sử làm thêm giờ');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const handleRefresh = useCallback(() => {
    fetchHistory(1, true);
  }, [fetchHistory]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Lịch sử làm thêm giờ" canGoBack />
      
      <OvertimeHistoryTab
        historyData={historyData}
        pagination={pagination}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        navigation={navigation}
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

export default OvertimeHistoryScreen;
