import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StatCard from '../../common/StatCard';

const { width } = Dimensions.get('window');

const LeaveDashboardTab = ({ dashboard, selectedYear, onYearChange, onRefresh, refreshing }) => {
  // Year selector
  const years = [2024, 2025, 2026];

  // Format number with thousand separator
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Default dashboard data if empty
  const data = dashboard || {};
  const overallStats = data.overallStats || {};
  const departmentStats = data.departmentStats || [];
  const monthlyTrends = data.monthlyTrends || [];
  const leaveTypeStats = data.leaveTypeStats || [];
  const recentActivity = data.recentActivity || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Year Selector */}
      <View style={styles.yearSelectorContainer}>
        <Text style={styles.yearSelectorLabel}>Năm:</Text>
        <View style={styles.yearButtons}>
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              style={[styles.yearButton, selectedYear === year && styles.yearButtonActive]}
              onPress={() => onYearChange(year)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.yearButtonText, selectedYear === year && styles.yearButtonTextActive]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Overall Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng quan</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Tổng yêu cầu"
            value={formatNumber(overallStats?.totalRequests || 0)}
            icon="file-document-outline"
            color="#4F46E5"
          />
          <StatCard
            title="Chờ duyệt"
            value={formatNumber(overallStats?.pending || 0)}
            icon="clock-outline"
            color="#F59E0B"
          />
          <StatCard
            title="Đã duyệt"
            value={formatNumber(overallStats?.approved || 0)}
            icon="check-circle-outline"
            color="#10B981"
          />
          <StatCard
            title="Đã từ chối"
            value={formatNumber(overallStats?.rejected || 0)}
            icon="close-circle-outline"
            color="#EF4444"
          />
        </View>
      </View>

      {/* Monthly Trends */}
      {monthlyTrends.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xu hướng theo tháng</Text>
          <View style={styles.trendsContainer}>
            {monthlyTrends.map((trend, index) => (
              <View key={index} style={styles.trendItem}>
                <View style={styles.trendBarContainer}>
                  <View
                    style={[
                      styles.trendBar,
                      {
                        height: `${Math.min(
                          ((trend.count || 0) / (overallStats?.maxMonthlyCount || 10)) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.trendMonth}>T{trend.month}</Text>
                <Text style={styles.trendValue}>{trend.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Leave Type Stats */}
      {leaveTypeStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theo loại nghỉ phép</Text>
          {leaveTypeStats.map((stat, index) => (
            <View key={index} style={styles.leaveTypeItem}>
              <View style={styles.leaveTypeHeader}>
                <MaterialCommunityIcons
                  name="calendar-star"
                  size={20}
                  color="#4F46E5"
                />
                <Text style={styles.leaveTypeLabel}>{stat.typeLabel || stat.type}</Text>
                <Text style={styles.leaveTypeCount}>{formatNumber(stat.count)}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(
                        ((stat.count || 0) / (overallStats?.totalRequests || 1)) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.leaveTypeDays}>{formatNumber(stat.totalDays)} ngày</Text>
            </View>
          ))}
        </View>
      )}

      {/* Department Stats */}
      {departmentStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theo phòng ban</Text>
          {departmentStats.map((dept, index) => (
            <View key={index} style={styles.departmentCard}>
              <View style={styles.departmentHeader}>
                <Icon name="business" size={20} color="#4F46E5" />
                <Text style={styles.departmentName}>{dept.department}</Text>
              </View>
              <View style={styles.departmentStats}>
                <View style={styles.deptStat}>
                  <Text style={styles.deptStatValue}>{formatNumber(dept.totalRequests)}</Text>
                  <Text style={styles.deptStatLabel}>Yêu cầu</Text>
                </View>
                <View style={styles.deptStat}>
                  <Text style={styles.deptStatValue}>{formatNumber(dept.totalDays)}</Text>
                  <Text style={styles.deptStatLabel}>Ngày</Text>
                </View>
                <View style={styles.deptStat}>
                  <Text style={[styles.deptStatValue, { color: '#F59E0B' }]}>
                    {formatNumber(dept.pending)}
                  </Text>
                  <Text style={styles.deptStatLabel}>Chờ duyệt</Text>
                </View>
                <View style={styles.deptStat}>
                  <Text style={[styles.deptStatValue, { color: '#10B981' }]}>
                    {formatNumber(dept.approved)}
                  </Text>
                  <Text style={styles.deptStatLabel}>Đã duyệt</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View
                style={[
                  styles.activityIcon,
                  {
                    backgroundColor:
                      activity.type === 'approved'
                        ? '#D1FAE5'
                        : activity.type === 'rejected'
                        ? '#FEE2E2'
                        : '#FEF3C7',
                  },
                ]}
              >
                <Icon
                  name={
                    activity.type === 'approved'
                      ? 'check'
                      : activity.type === 'rejected'
                      ? 'close'
                      : 'access-time'
                  }
                  size={16}
                  color={
                    activity.type === 'approved'
                      ? '#10B981'
                      : activity.type === 'rejected'
                      ? '#EF4444'
                      : '#F59E0B'
                  }
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {monthlyTrends.length === 0 &&
        leaveTypeStats.length === 0 &&
        departmentStats.length === 0 &&
        recentActivity.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="bar-chart" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>Chưa có dữ liệu thống kê</Text>
          </View>
        )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  yearSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  yearSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 12,
  },
  yearButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  yearButtonActive: {
    backgroundColor: '#4F46E5',
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  yearButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  trendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    height: 200,
  },
  trendItem: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarContainer: {
    width: 24,
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBar: {
    width: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
    minHeight: 4,
  },
  trendMonth: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  leaveTypeItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  leaveTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaveTypeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  leaveTypeCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  leaveTypeDays: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  departmentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  departmentName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  departmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deptStat: {
    alignItems: 'center',
  },
  deptStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  deptStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
});

export default LeaveDashboardTab;
