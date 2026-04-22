import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import Header from '../../../components/common/Header';

const HistoryScreen = () => {
  const { theme } = useTheme();
  const { colors, isDarkMode } = theme;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Mock Data
  const historyData = [
    { id: '1', date: '13/02/2026', checkIn: '08:30', checkOut: '--:--', status: 'working', workingHours: '4h 30m' },
    { id: '2', date: '12/02/2026', checkIn: '08:00', checkOut: '17:30', status: 'completed', workingHours: '8h 30m' },
    { id: '3', date: '11/02/2026', checkIn: '08:15', checkOut: '17:45', status: 'late', workingHours: '8h 30m' },
    { id: '4', date: '10/02/2026', checkIn: '08:00', checkOut: '17:30', status: 'completed', workingHours: '8h 30m' },
    { id: '5', date: '09/02/2026', checkIn: '08:05', checkOut: '17:35', status: 'completed', workingHours: '8h 30m' },
    { id: '6', date: '08/02/2026', checkIn: '--:--', checkOut: '--:--', status: 'off', workingHours: '0h 0m' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'working': return colors.primary;
      case 'completed': return colors.success;
      case 'late': return colors.warning;
      case 'off': return colors.subText;
      default: return colors.subText;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'working': return isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE';
      case 'completed': return isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5';
      case 'late': return isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7';
      case 'off': return isDarkMode ? 'rgba(156, 163, 175, 0.2)' : '#F3F4F6';
      default: return isDarkMode ? 'rgba(156, 163, 175, 0.2)' : '#F3F4F6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'working': return 'Đang làm việc';
      case 'completed': return 'Hoàn thành';
      case 'late': return 'Đi muộn';
      case 'off': return 'Nghỉ';
      default: return 'Không xác định';
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      {/* Date & Status Header */}
      <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.dateRow}>
          <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.subText} />
          <Text style={[styles.dateText, { color: colors.text }]}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {/* Time Details */}
      {item.status !== 'off' ? (
        <View style={styles.cardBody}>
          <View style={styles.timeBlock}>
            <Text style={[styles.timeLabel, { color: colors.subText }]}>Giờ vào</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>{item.checkIn}</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.timeBlock}>
            <Text style={[styles.timeLabel, { color: colors.subText }]}>Giờ ra</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>{item.checkOut}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.timeBlock}>
            <Text style={[styles.timeLabel, { color: colors.subText }]}>Tổng giờ</Text>
            <Text style={[styles.timeValue, { color: colors.text, fontWeight: '700' }]}>{item.workingHours}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.offBody}>
           <Text style={[styles.offText, { color: colors.subText }]}>Ngày nghỉ phép / Cuối tuần</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Header
        title="Lịch sử chấm công"
        rightActions={[{ icon: 'filter-outline', onPress: () => {} }]}
      />

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity style={[styles.monthNavButton, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.monthDisplay}>
          <Text style={[styles.monthText, { color: colors.text }]}>Tháng {selectedMonth}, {selectedYear}</Text>
        </View>
        <TouchableOpacity style={[styles.monthNavButton, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
           <Text style={[styles.summaryValue, { color: colors.primary }]}>22</Text>
           <Text style={[styles.summaryLabel, { color: colors.subText }]}>Công chuẩn</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
           <Text style={[styles.summaryValue, { color: colors.warning }]}>1</Text>
           <Text style={[styles.summaryLabel, { color: colors.subText }]}>Đi muộn</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
           <Text style={[styles.summaryValue, { color: colors.success }]}>185h</Text>
           <Text style={[styles.summaryLabel, { color: colors.subText }]}>Tổng giờ</Text>
        </View>
      </View>

      <FlatList
        data={historyData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 30,
  },
  offBody: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default HistoryScreen;
