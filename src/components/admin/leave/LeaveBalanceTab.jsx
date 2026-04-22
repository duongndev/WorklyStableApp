import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { getAllLeaveBalancesAction } from '../../../redux/adminLeave/adminLeaveAction';

const LeaveBalanceTab = ({ leaveBalances, selectedYear, onYearChange, onRefresh, refreshing, navigation }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  // Get unique departments from data
  const departments = ['all', ...new Set(leaveBalances.map((item) => item.employee?.department).filter(Boolean))];

  // Filter balances
  const filteredBalances = leaveBalances.filter((item) => {
    const employee = item.employee;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      employee?.fullName?.toLowerCase().includes(query) ||
      employee?.email?.toLowerCase().includes(query) ||
      employee?.department?.toLowerCase().includes(query);
    const matchesDepartment = selectedDepartment === 'all' || employee?.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Year selector
  const years = [2024, 2025, 2026];

  // Format number
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString();
  };

  // Calculate percentage for progress bar
  const getPercentage = (used, total) => {
    if (!total) return 0;
    const percentage = (used / total) * 100;
    return Math.min(percentage, 100);
  };

  // Toggle expand employee
  const toggleExpand = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  // Handle view employee detail
  const handleViewEmployee = (employee) => {
    navigation.navigate('EmployeeLeaveDetail', { employeeId: employee._id || employee.id });
  };

  // Render employee balance card
  const renderBalanceItem = ({ item }) => {
    const employee = item.employee;
    const balances = item.balances || [];
    const summary = item.summary || {};
    const isExpanded = expandedEmployee === (employee?._id || employee?.id);

    if (!employee) return null;

    return (
      <View style={styles.balanceCard}>
        {/* Employee Header */}
        <TouchableOpacity
          style={styles.employeeHeader}
          onPress={() => toggleExpand(employee._id || employee.id)}
          activeOpacity={0.8}
        >
          <View style={styles.employeeInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(employee.fullName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.employeeDetails}>
              <Text style={styles.employeeName}>{employee.fullName || 'Không xác định'}</Text>
              <Text style={styles.employeeMeta}>
                {employee.department || 'N/A'} • {employee.position || 'N/A'}
              </Text>
              <Text style={styles.employeeEmail}>{employee.email || ''}</Text>
            </View>
          </View>
          <View style={styles.expandIcon}>
            <Icon
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color="#6B7280"
            />
          </View>
        </TouchableOpacity>

        {/* Balance Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatNumber(summary.totalPaidLeave)}</Text>
            <Text style={styles.summaryLabel}>Nghỉ có lương</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatNumber(summary.totalUnpaidLeave)}</Text>
            <Text style={styles.summaryLabel}>Nghỉ không lương</Text>
          </View>
        </View>

        {/* Expanded Balance Details */}
        {isExpanded && (
          <View style={styles.balanceDetails}>
            <Text style={styles.balanceTitle}>Chi tiết số dư</Text>
            {balances.map((balance, index) => (
              <View key={index} style={styles.balanceItem}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceType}>{balance.label || balance.type}</Text>
                  <Text style={styles.balanceNumbers}>
                    <Text style={styles.usedText}>{formatNumber(balance.used)}</Text>
                    <Text style={styles.totalText}> / {formatNumber(balance.total)} ngày</Text>
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${getPercentage(balance.used, balance.total)}%`,
                          backgroundColor:
                            balance.percentage > 80
                              ? '#EF4444'
                              : balance.percentage > 50
                              ? '#F59E0B'
                              : '#10B981',
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.percentageText,
                      {
                        color:
                          balance.percentage > 80
                            ? '#EF4444'
                            : balance.percentage > 50
                            ? '#F59E0B'
                            : '#10B981',
                      },
                    ]}
                  >
                    {formatNumber(balance.percentage?.toFixed(1))}%
                  </Text>
                </View>

                <Text style={styles.remainingText}>
                  Còn lại: <Text style={styles.remainingValue}>{formatNumber(balance.remaining)}</Text> ngày
                </Text>
              </View>
            ))}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.viewDetailBtn}
                onPress={() => handleViewEmployee(employee)}
              >
                <Icon name="visibility" size={16} color="#4F46E5" />
                <Text style={styles.viewDetailText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhân viên..."
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

        {/* Department Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.departmentSelector}
        >
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept}
              style={[styles.deptChip, selectedDepartment === dept && styles.deptChipActive]}
              onPress={() => setSelectedDepartment(dept)}
            >
              <Text style={[styles.deptChipText, selectedDepartment === dept && styles.deptChipTextActive]}>
                {dept === 'all' ? 'Tất cả' : dept}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Hiển thị <Text style={styles.statsNumber}>{filteredBalances.length}</Text> / {leaveBalances.length} nhân viên
        </Text>
      </View>

      {/* Balance List */}
      <FlatList
        data={filteredBalances}
        keyExtractor={(item) => (item.employee?._id || item.employee?.id || Math.random()).toString()}
        renderItem={renderBalanceItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-balance" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>Không có dữ liệu số dư nghỉ phép</Text>
            {searchQuery.length > 0 && (
              <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
            )}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  departmentSelector: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  deptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deptChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  deptChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  deptChipTextActive: {
    color: '#4F46E5',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsNumber: {
    fontWeight: 'bold',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  balanceCard: {
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
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  employeeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  employeeMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  employeeEmail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  expandIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  balanceDetails: {
    paddingTop: 16,
  },
  balanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  balanceItem: {
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  balanceNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
  remainingText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  remainingValue: {
    fontWeight: 'bold',
    color: '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  viewDetailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
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

export default LeaveBalanceTab;
