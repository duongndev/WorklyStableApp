import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Header from '../../components/common/Header';

const { width } = Dimensions.get('window');

// Configure Vietnamese locale
LocaleConfig.locales['vi'] = {
  monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  monthNamesShort: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
  dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

const WorkScheduleScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  const [scheduleData, setScheduleData] = useState({
    '2024-03-20': [
      {
        id: 1,
        employeeName: 'Nguyễn Văn A',
        employeeId: 'NV001',
        department: 'Kỹ thuật',
        shift: 'Sáng',
        startTime: '08:00',
        endTime: '12:00',
        location: 'Văn phòng chính',
        status: 'scheduled',
      },
      {
        id: 2,
        employeeName: 'Trần Thị B',
        employeeId: 'NV002',
        department: 'Nhân sự',
        shift: 'Cả ngày',
        startTime: '08:00',
        endTime: '17:30',
        location: 'Văn phòng chính',
        status: 'scheduled',
      },
    ],
    '2024-03-21': [
      {
        id: 3,
        employeeName: 'Lê Văn C',
        employeeId: 'NV003',
        department: 'Kinh doanh',
        shift: 'Chiều',
        startTime: '13:00',
        endTime: '17:30',
        location: 'Văn phòng chi nhánh',
        status: 'scheduled',
      },
    ],
    '2024-03-22': [
      {
        id: 4,
        employeeName: 'Phạm Thị D',
        employeeId: 'NV004',
        department: 'Marketing',
        shift: 'Sáng',
        startTime: '08:00',
        endTime: '12:00',
        location: 'Làm việc từ xa',
        status: 'remote',
      },
    ],
  });

  const [employees] = useState([
    { id: 1, name: 'Nguyễn Văn A', department: 'Kỹ thuật', avatar: null },
    { id: 2, name: 'Trần Thị B', department: 'Nhân sự', avatar: null },
    { id: 3, name: 'Lê Văn C', department: 'Kinh doanh', avatar: null },
    { id: 4, name: 'Phạm Thị D', department: 'Marketing', avatar: null },
    { id: 5, name: 'Hoàng Văn E', department: 'Kế toán', avatar: null },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#10B981';
      case 'remote': return '#3B82F6';
      case 'leave': return '#F59E0B';
      case 'absent': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Đã lịch';
      case 'remote': return 'Làm từ xa';
      case 'leave': return 'Nghỉ phép';
      case 'absent': return 'Vắng mặt';
      default: return 'Không xác định';
    }
  };

  const getShiftColor = (shift) => {
    switch (shift) {
      case 'Sáng': return '#10B981';
      case 'Chiều': return '#F59E0B';
      case 'Đêm': return '#6366F1';
      case 'Cả ngày': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getMarkedDates = () => {
    const marked = {};
    Object.keys(scheduleData).forEach(date => {
      const schedules = scheduleData[date];
      const hasSchedule = schedules.length > 0;
      
      marked[date] = {
        marked: hasSchedule,
        dotColor: hasSchedule ? '#4F46E5' : 'transparent',
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? '#4F46E5' : 'transparent',
      };
    });
    
    return marked;
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const daySchedules = scheduleData[day.dateString] || [];
    setSelectedDaySchedule({
      date: day.dateString,
      schedules: daySchedules,
    });
    setShowDetailModal(true);
  };

  const renderScheduleItem = (item) => (
    <View style={styles.scheduleItem}>
      <View style={styles.itemHeader}>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.employeeName}</Text>
          <Text style={styles.employeeDetails}>{item.employeeId} • {item.department}</Text>
        </View>
        <View style={[styles.shiftBadge, { backgroundColor: getShiftColor(item.shift) + '20' }]}>
          <Text style={[styles.shiftText, { color: getShiftColor(item.shift) }]}>
            {item.shift}
          </Text>
        </View>
      </View>
      
      <View style={styles.scheduleDetails}>
        <View style={styles.detailRow}>
          <Icon name="access-time" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="info" size={16} color="#6B7280" />
          <Text style={[styles.detailText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmployeeSchedule = (employee) => {
    const employeeSchedules = [];
    Object.keys(scheduleData).forEach(date => {
      const daySchedules = scheduleData[date].filter(s => 
        s.employeeName === employee.name
      );
      if (daySchedules.length > 0) {
        employeeSchedules.push({ date, schedules: daySchedules });
      }
    });

    return (
      <View key={employee.id} style={styles.employeeScheduleCard}>
        <View style={styles.employeeCardHeader}>
          <View style={styles.employeeAvatar}>
            <Text style={styles.avatarText}>
              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeDepartment}>{employee.department}</Text>
          </View>
        </View>
        
        <View style={styles.employeeScheduleList}>
          {employeeSchedules.map(({ date, schedules }) => (
            <View key={date} style={styles.daySchedule}>
              <Text style={styles.dayDate}>{date}</Text>
              {schedules.map((schedule, index) => (
                <View key={index} style={styles.miniScheduleItem}>
                  <Text style={styles.miniShift}>{schedule.shift}</Text>
                  <Text style={styles.miniTime}>{schedule.startTime}-{schedule.endTime}</Text>
                  <Text style={styles.miniLocation}>{schedule.location}</Text>
                </View>
              ))}
            </View>
          ))}
          {employeeSchedules.length === 0 && (
            <Text style={styles.noScheduleText}>Chưa có lịch làm việc</Text>
          )}
        </View>
      </View>
    );
  };

  const markedDates = getMarkedDates();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header 
        title="Lịch biểu làm việc" 
        canGoBack 
        rightActions={[
          { 
            icon: viewMode === 'calendar' ? 'list' : 'calendar-outline', 
            onPress: () => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar') 
          }
        ]}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {viewMode === 'calendar' ? (
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={markedDates}
              markingType={'dot'}
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#4F46E5',
                selectedDayBackgroundColor: '#4F46E5',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#4F46E5',
                dayTextColor: '#1F2937',
                textDisabledColor: '#9CA3AF',
                dotColor: '#4F46E5',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#4F46E5',
                monthTextColor: '#1F2937',
                textDayFontWeight: '500',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '600',
              }}
              style={styles.calendar}
            />
            
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Chú thích:</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
                  <Text style={styles.legendText}>Có lịch làm việc</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Ca sáng</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.legendText}>Ca chiều</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
                  <Text style={styles.legendText}>Ca đêm</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Lịch làm việc theo nhân viên</Text>
            {employees.map(renderEmployeeSchedule)}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Lịch làm việc ngày {selectedDaySchedule?.date}
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedDaySchedule?.schedules.length > 0 ? (
                selectedDaySchedule.schedules.map(renderScheduleItem)
              ) : (
                <View style={styles.emptySchedule}>
                  <Icon name="event-busy" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyScheduleText}>
                    Không có lịch làm việc trong ngày này
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 10,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeViewModeButton: {
    backgroundColor: '#4F46E5',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  activeViewModeText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  calendarContainer: {
    paddingHorizontal: 20,
  },
  calendar: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  legendContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  employeeScheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  employeeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  employeeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  employeeDepartment: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  employeeScheduleList: {
    gap: 10,
  },
  daySchedule: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  miniScheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  miniShift: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    minWidth: 50,
  },
  miniTime: {
    fontSize: 12,
    color: '#4B5563',
    minWidth: 80,
  },
  miniLocation: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  noScheduleText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  scheduleItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  employeeDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  shiftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shiftText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  emptySchedule: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyScheduleText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
  },
});

export default WorkScheduleScreen;
