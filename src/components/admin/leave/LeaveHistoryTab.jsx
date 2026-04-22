import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import StatusFilter from '../../common/StatusFilter';
import { useStatusFilter } from '../../../hooks/useStatusFilter';
import { LEAVE_STATUS_FILTERS } from '../../../utils/filterConfigs';
import { STATUS_CONFIG } from '../../../utils/statusConfigs';
import { LEAVE_TYPE_CONFIG } from '../../../utils/leaveTypeConfigs';
import {
  getLeaveHistoryAction,
  setHistoryPage,
} from '../../../redux/adminLeave/adminLeaveAction';

const LeaveHistoryTab = ({ leaveHistory, selectedYear, onYearChange, onRefresh, refreshing, navigation }) => {
  const dispatch = useDispatch();
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const [localLoading, setLocalLoading] = useState(false);

  // Use the custom hook for status filtering
  const {
    selectedFilter,
    filters,
    filteredData: filteredByStatus,
    handleFilterSelect,
  } = useStatusFilter(LEAVE_STATUS_FILTERS, leaveHistory, 'status');

  // Filter by leave type
  const leaveTypeFilters = [
    { key: 'all', label: 'Tất cả' },
    ...Object.entries(LEAVE_TYPE_CONFIG).map(([key, config]) => ({
      key,
      label: config.label,
    })),
  ];

  const filteredHistory = filteredByStatus.filter((item) => {
    if (selectedLeaveType === 'all') return true;
    return item.leaveType === selectedLeaveType;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get status config
  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  // Get leave type config
  const getLeaveTypeConfig = (leaveType) => {
    return LEAVE_TYPE_CONFIG[leaveType] || {
      label: 'Nghỉ phép',
      color: '#3B82F6',
      icon: 'calendar-star',
    };
  };

  // Render history item
  const renderHistoryItem = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    const leaveTypeConfig = getLeaveTypeConfig(item.leaveType);
    const canCancel = item.canCancel !== false;
    const canEdit = item.canEdit !== false;

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => navigation.navigate('LeaveRequestDetail', { requestId: item._id || item.id })}
        activeOpacity={0.8}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.typeContainer}>
            <View style={[styles.iconBox, { backgroundColor: leaveTypeConfig.color }]}>
              <MaterialCommunityIcons name={leaveTypeConfig.icon} size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.typeLabel}>{leaveTypeConfig.label}</Text>
              <Text style={styles.durationText}>
                {item.durationDisplay || `${item.duration} ngày`}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          {/* Employee Info */}
          <View style={styles.infoRow}>
            <Icon name="person" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {item.employeeInfo?.fullName || 'Không xác định'}
            </Text>
            <Text style={styles.deptText}>
              ({item.employeeInfo?.department || 'N/A'})
            </Text>
          </View>

          {/* Date Info */}
          <View style={styles.infoRow}>
            <Icon name="date-range" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>

          {/* Approver Info (if approved) */}
          {item.status === 'approved' && item.approverInfo && (
            <View style={styles.infoRow}>
              <Icon name="verified-user" size={16} color="#10B981" />
              <Text style={[styles.infoText, { color: '#10B981' }]}>
                Duyệt bởi: {item.approverInfo.fullName}
              </Text>
            </View>
          )}

          {/* Days Until Start */}
          {item.daysUntilStart !== undefined && item.daysUntilStart > 0 && (
            <View style={styles.daysUntilContainer}>
              <Text style={styles.daysUntilText}>
                Còn {item.daysUntilStart} ngày đến ngày nghỉ
              </Text>
            </View>
          )}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>ID: {(item._id || item.id)?.slice(-6)}</Text>
          <View style={styles.actionContainer}>
            {canEdit && (
              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="edit" size={16} color="#4F46E5" />
              </TouchableOpacity>
            )}
            {canCancel && (
              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="cancel" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Year selector
  const years = [2024, 2025, 2026];

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Year Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.yearSelector}
        >
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              style={[styles.yearChip, selectedYear === year && styles.yearChipActive]}
              onPress={() => onYearChange(year)}
            >
              <Text style={[styles.yearChipText, selectedYear === year && styles.yearChipTextActive]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filter */}
        <StatusFilter
          filters={filters}
          selectedFilter={selectedFilter}
          onSelectFilter={handleFilterSelect}
        />

        {/* Leave Type Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.leaveTypeSelector}
        >
          {leaveTypeFilters.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.leaveTypeChip,
                selectedLeaveType === type.key && styles.leaveTypeChipActive,
              ]}
              onPress={() => setSelectedLeaveType(type.key)}
            >
              <Text
                style={[
                  styles.leaveTypeChipText,
                  selectedLeaveType === type.key && styles.leaveTypeChipTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Tổng số: <Text style={styles.summaryNumber}>{filteredHistory.length}</Text> bản ghi
        </Text>
      </View>

      {/* History List */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => (item._id || item.id).toString()}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>Không có lịch sử nghỉ phép</Text>
            <Text style={styles.emptySubtext}>Thử thay đổi bộ lọc để xem dữ liệu khác</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  yearSelector: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  yearChipActive: {
    backgroundColor: '#4F46E5',
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  yearChipTextActive: {
    color: '#FFFFFF',
  },
  leaveTypeSelector: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  leaveTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  leaveTypeChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  leaveTypeChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  leaveTypeChipTextActive: {
    color: '#4F46E5',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryNumber: {
    fontWeight: 'bold',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  deptText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  daysUntilContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  daysUntilText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default LeaveHistoryTab;
