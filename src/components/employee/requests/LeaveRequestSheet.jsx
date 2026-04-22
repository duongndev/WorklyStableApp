import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LEAVE_TYPES = [
  { id: 'annual', label: 'Nghỉ phép năm', icon: 'calendar-star', color: '#3B82F6' },
  { id: 'sick', label: 'Nghỉ ốm', icon: 'medical-bag', color: '#EF4444' },
  { id: 'hourly', label: 'Nghỉ theo giờ', icon: 'clock-time-four-outline', color: '#6366F1' },
  { id: 'unpaid', label: 'Không lương', icon: 'cash-off', color: '#F59E0B' },
  { id: 'remote', label: 'Làm từ xa', icon: 'laptop', color: '#10B981' },
  { id: 'other', label: 'Khác', icon: 'dots-horizontal', color: '#8B5CF6' },
];

const LeaveRequestSheet = ({ visible, onClose, onSubmit, initialData }) => {
  const { theme } = useTheme();
  const { colors, isDarkMode } = theme;

  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // Initialize with initialData if provided
  useEffect(() => {
    if (visible && initialData) {
      setReason(initialData.reason || '');
      setFromDate(initialData.fromDate || '');
      setToDate(initialData.toDate || '');
      setStartTime(initialData.startTime || '');
      setEndTime(initialData.endTime || '');
      setShowFromDatePicker(false);
      setShowToDatePicker(false);
      setShowStartTimePicker(false);
      setShowEndTimePicker(false);

      const typeIndex = LEAVE_TYPES.findIndex(t => t.id === initialData.type);
      if (typeIndex >= 0) setSelectedTypeIndex(typeIndex);
    } else if (visible && !initialData) {
      // Reset for new request
      setReason('');
      setFromDate('');
      setToDate('');
      setSelectedTypeIndex(0);
    }
  }, [visible, initialData]);

  const currentType = LEAVE_TYPES[selectedTypeIndex];

  const cycleType = () => {
    setSelectedTypeIndex(prev => (prev + 1) % LEAVE_TYPES.length);
  };

  const handleSubmit = () => {
    // Validate inputs if needed
    if (!fromDate || !toDate || !reason) {
      // Should show alert
      return;
    }
    
    // Additional validation for hourly leave
    if (currentType.id === 'hourly' && (!startTime || !endTime)) {
      // Should show alert
      return;
    }

    onSubmit({
      ...initialData, // Keep existing ID and other fields if editing
      type: currentType.id,
      fromDate,
      toDate,
      reason,
      startTime,
      endTime,
      status: 'pending',
      // If editing, keep original createdAt, else new date
      createdAt: initialData?.createdAt || new Date().toLocaleDateString('vi-VN'),
      // Find extra details for display
      ...currentType
    });

    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.sheetContainer, { backgroundColor: colors.background }]}>
          {/* Handle Bar */}
          <View style={styles.handleBarContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {initialData ? 'Cập nhật đơn xin nghỉ' : 'Tạo đơn xin nghỉ'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              
              {/* Leave Type Selector */}
              <TouchableOpacity
                style={[styles.typeHeader, { backgroundColor: currentType.color }]}
                activeOpacity={0.9}
                onPress={cycleType}
              >
                <View style={styles.typeContent}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name={currentType.icon} size={24} color={currentType.color} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.typeLabel}>{currentType.label}</Text>
                    <View style={styles.tapHintContainer}>
                      <Text style={styles.tapHint}>Chạm để đổi</Text>
                      <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(255,255,255,0.8)" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Date/Time Inputs */}
              <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Thời gian</Text>

              {currentType.id === 'hourly' ? (
                // Hourly Leave Inputs
                <View style={styles.dateRow}>
                  <View style={[styles.dateInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.dateLabel, { color: colors.subText }]}>Ngày nghỉ</Text>
                    <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
                      <TextInput
                        style={[styles.dateInput, { color: colors.text }]}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={colors.subText}
                        value={fromDate}
                        editable={false}
                        pointerEvents="none"
                      />
                    </TouchableOpacity>
                    {showFromDatePicker && (
                      <DateTimePicker
                        value={fromDate ? new Date(fromDate) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowFromDatePicker(false);
                          if (selectedDate) {
                            const formattedDate = selectedDate.toLocaleDateString('vi-VN');
                            setFromDate(formattedDate);
                            if (currentType.id === 'hourly') {
                              setToDate(formattedDate);
                            }
                          }
                        }}
                      />
                    )}
                   
                  </View>
                  <View style={{ flex: 1, gap: 10 }}>
                    <View style={[styles.timeInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.timeLabel, { color: colors.subText }]}>Từ giờ</Text>
                      <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
                        <TextInput
                          style={[styles.timeInput, { color: colors.text }]}
                          placeholder="08:00"
                          placeholderTextColor={colors.subText}
                          value={startTime}
                          editable={false}
                          pointerEvents="none"
                        />
                      </TouchableOpacity>
                      {showStartTimePicker && (
                        <DateTimePicker
                          value={startTime ? new Date(`2000-01-01T${startTime}`) : new Date()}
                          mode="time"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            setShowStartTimePicker(false);
                            if (selectedDate) {
                              const hours = selectedDate.getHours().toString().padStart(2, '0');
                              const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                              setStartTime(`${hours}:${minutes}`);
                            }
                          }}
                        />
                      )}
                    </View>
                    <View style={[styles.timeInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.timeLabel, { color: colors.subText }]}>Đến giờ</Text>
                      <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
                        <TextInput
                          style={[styles.timeInput, { color: colors.text }]}
                          placeholder="17:00"
                          placeholderTextColor={colors.subText}
                          value={endTime}
                          editable={false}
                          pointerEvents="none"
                        />
                      </TouchableOpacity>
                      {showEndTimePicker && (
                        <DateTimePicker
                          value={endTime ? new Date(`2000-01-01T${endTime}`) : new Date()}
                          mode="time"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            setShowEndTimePicker(false);
                            if (selectedDate) {
                              const hours = selectedDate.getHours().toString().padStart(2, '0');
                              const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                              setEndTime(`${hours}:${minutes}`);
                            }
                          }}
                        />
                      )}
                    </View>
                  </View>
                </View>
              ) : (
                // Normal Date Inputs
                <View style={styles.dateRow}>
                  <View style={[styles.dateInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.dateLabel, { color: colors.subText }]}>Từ ngày</Text>
                    <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
                      <TextInput
                        style={[styles.dateInput, { color: colors.text }]}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={colors.subText}
                        value={fromDate}
                        editable={false}
                        pointerEvents="none"
                      />
                    </TouchableOpacity>
                    {showFromDatePicker && (
                      <DateTimePicker
                        value={fromDate ? new Date(fromDate) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowFromDatePicker(false);
                          if (selectedDate) {
                            const formattedDate = selectedDate.toLocaleDateString('vi-VN');
                            setFromDate(formattedDate);
                          }
                        }}
                      />
                    )}
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={colors.subText} />
                  <View style={[styles.dateInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.dateLabel, { color: colors.subText }]}>Đến ngày</Text>
                    <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
                      <TextInput
                        style={[styles.dateInput, { color: colors.text }]}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={colors.subText}
                        value={toDate}
                        editable={false}
                        pointerEvents="none"
                      />
                    </TouchableOpacity>
                    {showToDatePicker && (
                      <DateTimePicker
                        value={toDate ? new Date(toDate) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowToDatePicker(false);
                          if (selectedDate) {
                            const formattedDate = selectedDate.toLocaleDateString('vi-VN');
                            setToDate(formattedDate);
                          }
                        }}
                      />
                    )}
                  </View>
                </View>
              )}

              {/* Reason Input */}
              <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Lý do</Text>
              <View style={[styles.reasonContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.reasonInput, { color: colors.text }]}
                  placeholder="Nhập lý do chi tiết..."
                  placeholderTextColor={colors.subText}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                />
              </View>

              
            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: currentType.color }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {initialData ? 'CẬP NHẬT' : 'GỬI YÊU CẦU'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.85, // 85% of screen height
    paddingTop: 10,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  typeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  typeLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  tapHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tapHint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  timeInputContainer: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  timeInput: {
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
    textAlign: 'right',
    minWidth: 40,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateInput: {
    fontSize: 16,
    fontWeight: '600',
    padding: 0,
  },
  reasonContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    height: 120,
  },
  reasonInput: {
    fontSize: 16,
    height: '100%',
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LeaveRequestSheet;
