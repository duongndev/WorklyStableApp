import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';


const QUICK_ACTIONS = [
  {
    id: 1,
    title: 'Xin nghỉ phép',
    icon: 'beach',
    screen: 'CreateLeave',
    color: '#EF4444',
    description: 'Đăng ký nghỉ phép, nghỉ ốm',
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    id: 2,
    title: 'Làm thêm giờ',
    icon: 'clock-time-eight',
    screen: 'OvertimeRequest',
    color: '#8B5CF6',
    description: 'Đăng ký và theo dõi OT',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  {
    id: 3,
    title: 'Lịch làm việc',
    icon: 'calendar-week',
    screen: 'WorkSchedule',
    color: '#10B981',
    description: 'Xem ca làm trong tuần',
    gradient: ['#10B981', '#059669'],
  },
  {
    id: 4,
    title: 'Bảng chấm công',
    icon: 'table-clock',
    screen: 'HistoryTab',
    color: '#3B82F6',
    description: 'Lịch sử chấm công',
    gradient: ['#3B82F6', '#2563EB'],
  }
];

const QuickActions = ({ colors, onNavigate }) => {
  return (
    <View style={styles.quickGrid}>
      {QUICK_ACTIONS.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.quickItem,
            { backgroundColor: colors.card, borderColor: item.color + '20' },
          ]}
          onPress={() => onNavigate(item.screen)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={item.gradient}
            style={styles.quickIconGradient}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color="#FFFFFF"
            />
          </LinearGradient>
          <Text style={[styles.quickTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text
            style={[
              styles.quickDescription,
              { color: colors.subText },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  quickItem: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },

  quickIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },

  quickDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default QuickActions;
