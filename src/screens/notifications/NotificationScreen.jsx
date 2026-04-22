import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/common/Header';
const NotificationScreen = () => {
  const notifications = [
    {
      id: '1',
      title: 'Yêu cầu nghỉ phép được duyệt',
      message: 'Yêu cầu nghỉ phép ngày 15/02 của bạn đã được quản lý chấp thuận.',
      time: '2 giờ trước',
      type: 'success', // success, info, warning, error
      read: false,
    },
    {
      id: '2',
      title: 'Nhắc nhở chấm công',
      message: 'Đừng quên chấm công ra trước khi ra về nhé!',
      time: '5 giờ trước',
      type: 'warning',
      read: true,
    },
    {
      id: '3',
      title: 'Bảng lương tháng 1',
      message: 'Bảng lương tháng 1/2026 đã được cập nhật. Vui lòng kiểm tra.',
      time: '1 ngày trước',
      type: 'info',
      read: true,
    },
    {
      id: '4',
      title: 'Thông báo họp team',
      message: 'Cuộc họp team định kỳ sẽ diễn ra vào 9:00 sáng mai tại phòng họp 1.',
      time: '2 ngày trước',
      type: 'info',
      read: true,
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-circle';
      case 'error':
        return 'close-circle';
      default:
        return 'information';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemContainer, !item.read && styles.unreadItem]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getColor(item.type)}15` }]}>
        <MaterialCommunityIcons name={getIcon(item.type)} size={24} color={getColor(item.type)} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.itemTitle, !item.read && styles.unreadText]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.itemMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
      {!item.read && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  // kiểm tra xem có thông báo nào chưa đọc không
  const hasUnread = notifications.some(n => !n.read);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Thông báo" canGoBack />


      {hasUnread && (
        <View style={styles.readAllContainer}>
          <Text style={[styles.readAllText, { color: '#111827' }]}>Đọc tất cả</Text>
          <TouchableOpacity style={styles.readAllButton} onPress={() => console.log('Đọc tất cả')}>
            <Text style={styles.readAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        </View>
      )}



      <FlatList
        data={notifications}
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
    backgroundColor: '#F9FAFB',
  },
  readAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  readAllButton: {
   
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    color: '#111827',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginTop: 6,
  },
  readAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
  },
});

export default NotificationScreen;
