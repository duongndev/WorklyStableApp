import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import Header from '../../../components/common/Header';

const WorkScheduleScreen = () => {
  const { theme } = useTheme();
  const { colors, isDarkMode } = theme;
  const [selectedDate, setSelectedDate] = useState('13/02'); // Mock selected date (Today)

  const schedules = [
    { id: 1, day: 'Th 2', date: '12/02', fullDate: 'Thứ 2, 12/02/2026', shift: 'Ca sáng (08:00 - 17:30)', status: 'completed' },
    { id: 2, day: 'Th 3', date: '13/02', fullDate: 'Thứ 3, 13/02/2026', shift: 'Ca sáng (08:00 - 17:30)', status: 'active' },
    { id: 3, day: 'Th 4', date: '14/02', fullDate: 'Thứ 4, 14/02/2026', shift: 'Ca sáng (08:00 - 17:30)', status: 'upcoming' },
    { id: 4, day: 'Th 5', date: '15/02', fullDate: 'Thứ 5, 15/02/2026', shift: 'Ca sáng (08:00 - 17:30)', status: 'upcoming' },
    { id: 5, day: 'Th 6', date: '16/02', fullDate: 'Thứ 6, 16/02/2026', shift: 'Ca sáng (08:00 - 17:30)', status: 'upcoming' },
    { id: 6, day: 'Th 7', date: '17/02', fullDate: 'Thứ 7, 17/02/2026', shift: 'Nghỉ', status: 'off' },
    { id: 7, day: 'CN', date: '18/02', fullDate: 'Chủ nhật, 18/02/2026', shift: 'Nghỉ', status: 'off' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.primary;
      case 'upcoming': return colors.text;
      case 'completed': return colors.success;
      case 'off': return colors.subText;
      default: return colors.subText;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE';
      case 'completed': return isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5';
      case 'off': return isDarkMode ? 'rgba(156, 163, 175, 0.1)' : '#F3F4F6';
      default: return colors.card;
    }
  };

  const renderTimelineItem = (item, index) => {
    const isLast = index === schedules.length - 1;
    const isSelected = item.date === selectedDate;

    return (
      <View key={item.id} style={styles.timelineRow}>
        {/* Left: Time/Date Column */}
        <View style={styles.leftCol}>
          <Text style={[styles.dayLabel, { color: isSelected ? colors.primary : colors.subText, fontWeight: isSelected ? '700' : '500' }]}>{item.day}</Text>
          <Text style={[styles.dateLabel, { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '700' : '600' }]}>{item.date}</Text>
        </View>

        {/* Center: Timeline Line & Dot */}
        <View style={styles.timelineCol}>
          <View style={[
            styles.timelineDot, 
            { 
              backgroundColor: item.status === 'active' ? colors.primary : 
                               item.status === 'completed' ? colors.success : 
                               item.status === 'off' ? colors.border : colors.border,
              borderColor: colors.background,
            }
          ]} />
          {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
        </View>

        {/* Right: Content Card */}
        <TouchableOpacity 
          style={[
            styles.scheduleCard, 
            { 
              backgroundColor: item.status === 'active' ? getStatusBg('active') : colors.card,
              borderColor: item.status === 'active' ? colors.primary : colors.border,
              borderWidth: item.status === 'active' ? 1 : 0,
              shadowColor: colors.shadow
            }
          ]}
          onPress={() => setSelectedDate(item.date)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
             <Text style={[styles.shiftTitle, { color: colors.text }]}>
               {item.status === 'off' ? 'Ngày nghỉ' : item.shift}
             </Text>
             {item.status === 'active' && (
               <View style={styles.nowBadge}>
                 <Text style={styles.nowText}>Hôm nay</Text>
               </View>
             )}
          </View>
          
          {item.status !== 'off' && (
            <View style={styles.cardFooter}>
              <View style={styles.timeInfo}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.subText} />
                <Text style={[styles.timeText, { color: colors.subText }]}>08:00 - 17:30</Text>
              </View>
              <View style={styles.locationInfo}>
                 <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.subText} />
                 <Text style={[styles.locationText, { color: colors.subText }]}>Văn phòng</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Header
        title="Lịch làm việc"
        canGoBack
        rightActions={[{ icon: 'calendar-outline', onPress: () => {} }]}
      />

      {/* Week Navigation */}
      <View style={styles.weekNav}>
        <Text style={[styles.weekTitle, { color: colors.subText }]}>Tuần này: 12/02 - 18/02</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {schedules.map((item, index) => renderTimelineItem(item, index))}
      </ScrollView>
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
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  calendarButton: {
     padding: 8,
     borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekNav: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  leftCol: {
    width: 50,
    alignItems: 'center',
    paddingTop: 16,
  },
  dayLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 16,
  },
  timelineCol: {
    width: 30,
    alignItems: 'center',
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 22,
    borderWidth: 2,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    position: 'absolute',
    top: 22,
    bottom: -22,
    zIndex: 1,
  },
  scheduleCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginLeft: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  nowBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  nowText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
     fontSize: 13,
  },
});

export default WorkScheduleScreen;
