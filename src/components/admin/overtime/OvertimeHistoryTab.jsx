import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StatusFilter from '../../common/StatusFilter';
import { useStatusFilter } from '../../../hooks/useStatusFilter';
import { OVERTIME_STATUS_FILTERS, OVERTIME_TYPE_FILTERS, getStatusColor, getStatusDisplay, getOvertimeTypeDisplay, formatHoursDisplay } from '../../../utils/overtimeConfigs';
import {
  getOvertimeHistoryAction,
  setPage,
} from '../../../redux/adminOvertime/adminOvertimeAction';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

const OvertimeHistoryTab = ({ historyData, pagination, onRefresh, refreshing, navigation }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  const overtimeRequests = historyData?.overtimeRequests || [];
  const summary = historyData?.summary || {};
  const departmentStats = historyData?.departmentStats || [];

  // Use the custom hook for status filtering
  const {
    selectedFilter,
    filters,
    filteredData: filteredByStatus,
    handleFilterSelect,
  } = useStatusFilter(OVERTIME_STATUS_FILTERS, overtimeRequests, 'status');

  // Apply search and type filter
  const filteredRequests = filteredByStatus.filter((request) => {
    const employeeName = request.employeeInfo?.fullName || '';
    const department = request.employeeInfo?.department || '';
    const overtimeType = request.overtimeType || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = (
      employeeName.toLowerCase().includes(query) ||
      department.toLowerCase().includes(query)
    );

    const matchesType = selectedTypeFilter === 'all' || overtimeType === selectedTypeFilter;

    return matchesSearch && matchesType;
  });

  // Load more data
  const loadMore = useCallback(async () => {
    if (pagination.hasNextPage && !localLoading) {
      setLocalLoading(true);
      const nextPage = pagination.currentPage + 1;
      await dispatch(getOvertimeHistoryAction({
        page: nextPage,
        limit: 10,
        status: selectedFilter === 'all' ? undefined : selectedFilter,
        overtimeType: selectedTypeFilter === 'all' ? undefined : selectedTypeFilter,
      }));
      dispatch(setPage(nextPage));
      setLocalLoading(false);
    }
  }, [pagination, localLoading, dispatch, selectedFilter, selectedTypeFilter]);

  // Format status color
  const getStatusColorValue = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  // Render history item
  const renderHistoryItem = ({ item }) => {
    const statusColor = getStatusColorValue(item.status);
    const overtimeTypeDisplay = getOvertimeTypeDisplay(item.overtimeType);
    const hoursDisplay = formatHoursDisplay(item.hoursWork);
    const statusText = getStatusDisplay(item.status);

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => navigation.navigate('OvertimeRequestDetail', { requestId: item._id })}
        activeOpacity={0.8}
      >
        <View style={styles.historyHeader}>
          <View style={styles.employeeSection}>
            <Text style={styles.employeeName}>{item.employeeInfo?.fullName || 'Không xác định'}</Text>
            <Text style={styles.employeeDetail}>
              {item.employeeInfo?.department || ''} • {item.employeeInfo?.position || ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Icon name="event" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Loại: {overtimeTypeDisplay}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Số giờ: {hoursDisplay}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="person" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              Người duyệt: {item.approverInfo?.fullName || 'Chưa duyệt'}
            </Text>
          </View>
        </View>

        {item.daysUntilOvertime > 0 && (
          <View style={styles.countdownBadge}>
            <Icon name="access-time" size={12} color="#4F46E5" />
            <Text style={styles.countdownText}>Còn {item.daysUntilOvertime} ngày</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render summary card
  const renderSummaryCard = () => {
    if (!summary) return null;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tổng quan lịch sử</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalRequests || 0}</Text>
            <Text style={styles.summaryLabel}>Tổng yêu cầu</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalHours || 0}</Text>
            <Text style={styles.summaryLabel}>Tổng giờ</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              {summary.pending?.count || 0}
            </Text>
            <Text style={styles.summaryLabel}>Chờ duyệt</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {summary.approved?.count || 0}
            </Text>
            <Text style={styles.summaryLabel}>Đã duyệt</Text>
          </View>
        </View>

        {/* Hours breakdown */}
        <View style={styles.hoursBreakdown}>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursLabel}>Chờ duyệt:</Text>
            <Text style={[styles.hoursValue, { color: '#F59E0B' }]}>
              {summary.pending?.hours || 0} giờ
            </Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursLabel}>Đã duyệt:</Text>
            <Text style={[styles.hoursValue, { color: '#10B981' }]}>
              {summary.approved?.hours || 0} giờ
            </Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursLabel}>Đã từ chối:</Text>
            <Text style={[styles.hoursValue, { color: '#EF4444' }]}>
              {summary.rejected?.hours || 0} giờ
            </Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursLabel}>Đã hủy:</Text>
            <Text style={[styles.hoursValue, { color: '#6B7280' }]}>
              {summary.cancelled?.hours || 0} giờ
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render department stats
  const renderDepartmentStats = () => {
    if (!departmentStats || departmentStats.length === 0) return null;

    return (
      <View style={styles.deptStatsSection}>
        <Text style={styles.sectionTitle}>Thống kê theo phòng ban</Text>
        {departmentStats.map((dept, index) => (
          <View key={index} style={styles.deptCard}>
            <View style={styles.deptHeader}>
              <Icon name="business" size={20} color="#4F46E5" />
              <Text style={styles.deptName}>{dept.department}</Text>
              <Text style={styles.deptTotal}>{dept.totalRequests} yêu cầu</Text>
            </View>
            <View style={styles.deptStats}>
              <View style={styles.deptStat}>
                <Text style={styles.deptStatValue}>{dept.totalHours}</Text>
                <Text style={styles.deptStatLabel}>Giờ</Text>
              </View>
              <View style={styles.deptStat}>
                <Text style={[styles.deptStatValue, { color: '#F59E0B' }]}>{dept.pending}</Text>
                <Text style={styles.deptStatLabel}>Chờ</Text>
              </View>
              <View style={styles.deptStat}>
                <Text style={[styles.deptStatValue, { color: '#10B981' }]}>{dept.approved}</Text>
                <Text style={styles.deptStatLabel}>Duyệt</Text>
              </View>
              <View style={styles.deptStat}>
                <Text style={[styles.deptStatValue, { color: '#EF4444' }]}>{dept.rejected}</Text>
                <Text style={styles.deptStatLabel}>Từ chối</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!localLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4F46E5" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={filteredRequests}
      keyExtractor={(item) => item._id.toString()}
      renderItem={renderHistoryItem}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={
        <View>
          {/* Summary Card */}
          {renderSummaryCard()}

          {/* Department Stats */}
          {renderDepartmentStats()}

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm nhân viên, phòng ban..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Type Filter */}
          <View style={styles.typeFilterContainer}>
            <Text style={styles.filterLabel}>Loại làm thêm:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilterList}>
              {OVERTIME_TYPE_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.typeChip,
                    selectedTypeFilter === filter.key && styles.typeChipActive,
                  ]}
                  onPress={() => setSelectedTypeFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedTypeFilter === filter.key && styles.typeChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Status Filter */}
          <StatusFilter
            filters={filters}
            selectedFilter={selectedFilter}
            onSelectFilter={handleFilterSelect}
          />

          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Hiển thị: <Text style={styles.statsNumber}>{filteredRequests.length}</Text> / {pagination.total || 0} yêu cầu
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Icon name="history" size={64} color="#E5E7EB" />
          <Text style={styles.emptyText}>Không có lịch sử làm thêm giờ nào</Text>
          {searchQuery.length > 0 && (
            <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
          )}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#F9FAFB',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  hoursBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  hoursLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  hoursValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  deptStatsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  deptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deptName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  deptTotal: {
    fontSize: 13,
    color: '#6B7280',
  },
  deptStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deptStat: {
    alignItems: 'center',
  },
  deptStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  deptStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  typeFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeFilterList: {
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  typeChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsNumber: {
    fontWeight: 'bold',
    color: '#111827',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeSection: {
    flex: 1,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  employeeDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsSection: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 8,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  countdownText: {
    fontSize: 12,
    color: '#4F46E5',
    marginLeft: 4,
    fontWeight: '500',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default OvertimeHistoryTab;
