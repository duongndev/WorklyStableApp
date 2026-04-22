import React from 'react';
import { View, StyleSheet } from 'react-native';
import ActivityItem from './ActivityItem';

const RECENT_ACTIVITIES = [
  {
    id: 1,
    icon: 'check-circle',
    text: 'Chấm công vào thành công',
    color: '#10B981',
    time: '08:30',
    type: 'Chấm công',
    detail: 'Ca sáng: 08:30 - 12:00',
  },
  {
    id: 2,
    icon: 'file-document-check',
    text: 'Đơn xin nghỉ đã được duyệt',
    color: '#3B82F6',
    time: '09:15',
    type: 'Nghỉ phép',
    detail: 'Ngày 25/02/2024 - 1 ngày',
  },
  {
    id: 3,
    icon: 'clock-time-eight',
    text: 'Đăng ký OT thành công',
    color: '#F59E0B',
    time: 'Hôm qua',
    type: 'Làm thêm',
    detail: '2 giờ - Ca tối',
  },
  {
    id: 4,
    icon: 'cash',
    text: 'Lương tháng 1 đã được chuyển',
    color: '#8B5CF6',
    time: '2 ngày trước',
    type: 'Lương',
    detail: 'Số tiền: 15,500,000 VNĐ',
  },
];

const RecentActivities = ({ colors }) => {
  return (
    <View
      style={[
        styles.activityCard,
        { backgroundColor: colors.card },
      ]}
    >
      {RECENT_ACTIVITIES.map((item, index) => (
        <View key={item.id}>
          <ActivityItem
            icon={item.icon}
            text={item.text}
            color={item.color}
            colors={colors}
            time={item.time}
            type={item.type}
            detail={item.detail}
          />
          {index < RECENT_ACTIVITIES.length - 1 && (
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  activityCard: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },

  divider: {
    height: 1,
    marginHorizontal: 52,
    marginVertical: 4,
  },
});

export default RecentActivities;
