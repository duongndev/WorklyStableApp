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
import StatCard from '../../common/StatCard';
import { getOvertimeTypeDisplay, getOvertimeTypeColor } from '../../../utils/overtimeConfigs';

const { width } = Dimensions.get('window');

const OvertimeDashboardTab = ({ dashboard, selectedYear, onYearChange, onRefresh, refreshing }) => {
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
  const overtimeTypeStats = data.overtimeTypeStats || [];
  const topEmployees = data.topEmployees || [];
  const recentActivity = data.recentActivity || [];

  // Get max monthly count for chart scaling
  const maxMonthlyCount = Math.max(...monthlyTrends.map(t => t.count || 0), 10);

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
        <Text style={styles.sectionTitle}>Tổng quan làm thêm giờ</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Tổng yêu cầu"
            value={formatNumber(overallStats?.totalRequests || 0)}
            icon="schedule"
            color="#4F46E5"
          />
          <StatCard
            title="Tổng giờ"
            value={formatNumber(overallStats?.totalHours || 0)}
            icon="access-time"
            color="#8B5CF6"
          />
          <StatCard
            title="Chờ duyệt"
            value={formatNumber(overallStats?.pending?.count || 0)}
            icon="clock-outline"
            color="#F59E0B"
          />
          <StatCard
            title="Đã duyệt"
            value={formatNumber(overallStats?.approved?.count || 0)}
            icon="check-circle-outline"
            color="#10B981"
          />
        </View>
      </View>

      {/* Hours Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thống kê giờ làm</Text>
        <View style={styles.hoursCard}>
          <View style={styles.hoursRow}>
            <View style={styles.hoursItem}>
              <Text style={[styles.hoursValue, { color: '#F59E0B' }]}>
                {formatNumber(overallStats?.pending?.hours || 0)}
              </Text>
              <Text style={styles.hoursLabel}>Giờ chờ duyệt</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={[styles.hoursValue, { color: '#10B981' }]}>
                {formatNumber(overallStats?.approved?.hours || 0)}
              </Text>
              <Text style={styles.hoursLabel}>Giờ đã duyệt</Text>
            </View>
          </View>
          <View style={styles.hoursRow}>
            <View style={styles.hoursItem}>
              <Text style={[styles.hoursValue, { color: '#EF4444' }]}>
                {formatNumber(overallStats?.rejected?.hours || 0)}
              </Text>
              <Text style={styles.hoursLabel}>Giờ bị từ chối</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={[styles.hoursValue, { color: '#6B7280' }]}>
                {formatNumber(overallStats?.cancelled?.hours || 0)}
              </Text>
              <Text style={styles.hoursLabel}>Giờ đã hủy</Text>
            </View>
          </View>
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
                          ((trend.count || 0) / maxMonthlyCount) * 100,
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

      {/* Overtime Type Stats */}
      {overtimeTypeStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theo loại làm thêm</Text>
          {overtimeTypeStats.map((stat, index) => {
            const typeColor = getOvertimeTypeColor(stat.type);
            const typeDisplay = stat.typeDisplay || getOvertimeTypeDisplay(stat.type);

            return (
              <View key={index} style={styles.typeItem}>
                <View style={styles.typeHeader}>
                  <Icon name="schedule" size={20} color={typeColor} />
                  <Text style={styles.typeLabel}>{typeDisplay}</Text>
                  <Text style={styles.typeCount}>{formatNumber(stat.count)}</Text>
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
                        backgroundColor: typeColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.typeHours}>{formatNumber(stat.totalHours)} giờ</Text>
              </View>
            );
          })}
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
                  <Text style={styles.deptStatValue}>{formatNumber(dept.totalHours)}</Text>
                  <Text style={styles.deptStatLabel}>Giờ</Text>
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

      {/* Top Employees */}
      {topEmployees.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhân viên làm thêm nhiều nhất</Text>
          {topEmployees.map((employee, index) => (
            <View key={index} style={styles.employeeCard}>
              <View style={styles.topEmployeeRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.topEmployeeInfo}>
                <Text style={styles.topEmployeeName}>{employee.fullName}</Text>
                <Text style={styles.topEmployeeDetail}>
                  {employee.department} • {employee.position}
                </Text>
              </View>
              <View style={styles.topEmployeeStats}>
                <Text style={styles.topEmployeeHours}>{formatNumber(employee.totalHours)} giờ</Text>
                <Text style={styles.topEmployeeRequests}>{formatNumber(employee.totalRequests)} đơn</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {recentActivity.map((activity, index) => {
            const status = activity.status;
            const employeeName = activity.userId?.fullName || 'Không xác định';
            const approverName = activity.approverBy?.fullName;
            const overtimeType = activity.overtimeTypeDisplay || activity.overtimeType;
            const hours = activity.hoursWork;
            const date = activity.otDate ? new Date(activity.otDate).toLocaleDateString('vi-VN') : '';

            // Xác định màu sắc và icon dựa trên status
            const isApproved = status === 'approved';
            const isRejected = status === 'rejected';
            const isPending = status === 'pending';

            const iconBgColor = isApproved ? '#D1FAE5' : isRejected ? '#FEE2E2' : '#FEF3C7';
            const iconColor = isApproved ? '#10B981' : isRejected ? '#EF4444' : '#F59E0B';
            const iconName = isApproved ? 'check' : isRejected ? 'close' : 'access-time';

            // Tạo description text
            let description = '';
            if (isPending) {
              description = `${employeeName} đăng ký làm thêm ${overtimeType} (${hours} giờ)`;
            } else if (isApproved) {
              description = `${employeeName} - ${approverName || 'Admin'} đã duyệt ${overtimeType} (${hours} giờ)`;
            } else if (isRejected) {
              description = `${employeeName} - ${approverName || 'Admin'} đã từ chối ${overtimeType}`;
            }

            return (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: iconBgColor }]}>
                  <Icon name={iconName} size={16} color={iconColor} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText} numberOfLines={2}>{description}</Text>
                  <Text style={styles.activityTime}>{date}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Empty State */}
      {monthlyTrends.length === 0 &&
        overtimeTypeStats.length === 0 &&
        departmentStats.length === 0 &&
        topEmployees.length === 0 &&
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
  hoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hoursItem: {
    alignItems: 'center',
    flex: 1,
  },
  hoursValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  hoursLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  typeItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  typeCount: {
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
    borderRadius: 4,
  },
  typeHours: {
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
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  topEmployeeRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  topEmployeeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  topEmployeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  topEmployeeDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  topEmployeeStats: {
    alignItems: 'flex-end',
  },
  topEmployeeHours: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  topEmployeeRequests: {
    fontSize: 12,
    color: '#6B7280',
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

export default OvertimeDashboardTab;
