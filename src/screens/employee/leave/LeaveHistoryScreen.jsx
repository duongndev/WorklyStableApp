import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import LeaveRequestSheet from '../../../components/employee/requests/LeaveRequestSheet';
import Header from '../../../components/common/Header';
import RequestCard from '../../../components/common/RequestCard';
import StatusFilter from '../../../components/common/StatusFilter';
import { STATUS_CONFIG } from '../../../utils/filterConfigs';
import { useSelector, useDispatch } from 'react-redux';
import { clearError, clearMessage, resetLeaves } from '../../../redux/leave/leaveSlice';
import { getMyLeavesRequestAction, getLeaveStatisticsAction } from '../../../redux/leave/leaveAction';
import LoadingMore from '../../../components/common/LoadingMore';


const LeaveHistoryScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors } = theme;
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const dispatch = useDispatch();
  const { leavesList: leavesListRaw = [], loading, pagination, statistics } = useSelector((state) => state.leave);
  const leavesList = useMemo(() => {
    return Array.isArray(leavesListRaw) ? leavesListRaw : [];
  }, [leavesListRaw]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Create filters with statistics from API
  const filtersWithStats = useMemo(() => {
    const pending = statistics?.pending || 0;
    const approved = statistics?.approved || 0;
    const rejected = statistics?.rejected || 0;
    const allCount = pending + approved + rejected;

    return STATUS_CONFIG.map(filter => {
      if (filter.key === 'all') return { ...filter, count: allCount || leavesList.length };
      if (filter.key === 'pending') return { ...filter, count: pending };
      if (filter.key === 'approved') return { ...filter, count: approved };
      if (filter.key === 'rejected') return { ...filter, count: rejected };
      return { ...filter, count: 0 };
    });
  }, [statistics, leavesList.length]);

  const displayData = useMemo(() => {
    if (selectedStatus === 'all') return leavesList;
    return leavesList.filter(item => item?.status === selectedStatus);
  }, [leavesList, selectedStatus]);

  // Fetch statistics separately
  const fetchStatistics = useCallback(async () => {
    try {
      await dispatch(getLeaveStatisticsAction());
    } catch (statsError) {
      console.error('Failed to fetch statistics:', statsError);
    }
  }, [dispatch]);

  // Fetch leave data from API
  const fetchLeaveData = useCallback(async (page = 1, status = 'all', mode = 'initial') => {
    try {
      const query = { page, limit: 10 };
      if (status && status !== 'all') {
        query.status = status;
      }

      if (mode === 'refresh') {
        setRefreshing(true);
      }

      if (page === 1) {
        dispatch(clearError());
        dispatch(clearMessage());
        dispatch(resetLeaves());
      }

      const result = await dispatch(getMyLeavesRequestAction(query));

      if (getMyLeavesRequestAction.rejected.match(result)) {
        console.error('Failed to fetch leave data:', result.payload);
      }
    } catch (fetchError) {
      console.error('Failed to fetch leave data:', fetchError);
    } finally {
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [dispatch]);

  // Initial data fetch
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Handle filter change
  useEffect(() => {
    setCurrentPage(1);
    fetchLeaveData(1, selectedStatus, 'filter');
  }, [selectedStatus, fetchLeaveData]);

  const handleFilterSelect = useCallback((status) => {
    setSelectedStatus(status);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    fetchLeaveData(1, selectedStatus, 'refresh');
    fetchStatistics();
  }, [selectedStatus, fetchLeaveData, fetchStatistics]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loading && !isLoadingMore && !refreshing && pagination?.hasNextPage) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchLeaveData(nextPage, selectedStatus, 'loadMore');
    }
  }, [loading, isLoadingMore, refreshing, pagination, currentPage, selectedStatus, fetchLeaveData]);

  // Handle create new request
  const handleCreateRequest = useCallback((newRequest) => {
    // Close the sheet
    setIsSheetVisible(false);
    // Refresh data after creating new request (both list and statistics)
    setCurrentPage(1);
    fetchLeaveData(1, selectedStatus, 'filter');
    fetchStatistics();
  }, [selectedStatus, fetchLeaveData, fetchStatistics]);

  // Navigate to leave detail
  const handleLeavePress = useCallback((item) => {
    navigation.navigate('LeaveDetail', { item });
  }, [navigation]);

  const isInitialLoading = loading && leavesList.length === 0;

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="file-document-outline" size={60} color={colors.border} />
        <Text style={[styles.emptyText, { color: colors.subText }]}>
          {selectedStatus !== 'all' ? 'Không có đơn nghỉ nào với trạng thái đã chọn' : 'Chưa có đơn nghỉ nào'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Header title="Lịch sử nghỉ phép" canGoBack />

      <View style={styles.contentWrapper}>

        {/* Filters */}
        <StatusFilter
          filters={filtersWithStats}
          selectedFilter={selectedStatus}
          onSelectFilter={handleFilterSelect}
        />

        {isInitialLoading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.subText }]}>
              Đang tải danh sách đơn nghỉ...
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayData}
            renderItem={({ item }) => (
              <RequestCard
                item={item}
                onPress={handleLeavePress}
              />
            )}
            keyExtractor={(item, index) => item._id || item.id || `leave-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoadingMore ? <LoadingMore colors={colors} /> : null}
            ListEmptyComponent={renderEmptyState}
          />
        )}

        {/* FAB to create new request */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={() => setIsSheetVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Leave Request Sheet */}
        <LeaveRequestSheet
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default LeaveHistoryScreen;
