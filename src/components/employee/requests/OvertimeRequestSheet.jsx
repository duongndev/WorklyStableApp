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

const OvertimeRequestSheet = ({ visible, onClose, onSubmit, initialData }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const [project, setProject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Initialize with initialData if provided
  useEffect(() => {
    if (visible && initialData) {
      setProject(initialData.project || '');
      setDate(initialData.date || '');
      setStartTime(initialData.startTime || '');
      setEndTime(initialData.endTime || '');
      setReason(initialData.reason || '');
      setShowDatePicker(false);
      setShowStartTimePicker(false);
      setShowEndTimePicker(false);
    } else if (visible && !initialData) {
      // Reset for new request
      setProject('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setReason('');
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    // Validate inputs if needed
    if (!project || !date || !startTime || !endTime || !reason) {
      // Should show alert
      return;
    }

    onSubmit({
      ...initialData, // Keep existing ID and other fields if editing
      project,
      date,
      startTime,
      endTime,
      reason,
      status: 'pending',
      // If editing, keep original createdAt, else new date
      createdAt: initialData?.createdAt || new Date().toLocaleDateString('vi-VN'),
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
              {initialData ? 'Cập nhật đăng ký OT' : 'Tạo đăng ký OT'}
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
              
              {/* Header with gradient */}
              <View style={[styles.typeHeader, { backgroundColor: '#8B5CF6' }]}>
                <View style={styles.typeContent}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="clock-time-eight" size={24} color="#8B5CF6" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.typeLabel}>Đăng ký làm thêm giờ</Text>
                    <View style={styles.tapHintContainer}>
                      <Text style={styles.tapHint}>Điền thông tin OT</Text>
                      <MaterialCommunityIcons name="clock-outline" size={16} color="rgba(255,255,255,0.8)" />
                    </View>
                  </View>
                </View>
              </View>

              {/* Project Input */}
              <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Thông tin công việc</Text>
              <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.inputIcon}>
                  <MaterialCommunityIcons name="briefcase-outline" size={24} color="#8B5CF6" />
                </View>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Tên dự án / Công việc"
                  placeholderTextColor={colors.subText}
                  value={project}
                  onChangeText={setProject}
                />
              </View>

              {/* Date Input */}
              <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Ngày làm thêm</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#8B5CF6" />
                  </View>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Chọn ngày (DD/MM/YYYY)"
                    placeholderTextColor={colors.subText}
                    value={date}
                    editable={false}
                    pointerEvents="none"
                  />
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date ? new Date(date) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formattedDate = selectedDate.toLocaleDateString('vi-VN');
                      setDate(formattedDate);
                    }
                  }}
                />
              )}

              {/* Time Inputs */}
              <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Thời gian làm việc</Text>
              <View style={styles.timeRow}>
                {/* Start Time */}
                <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
                  <View style={[styles.timeBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.timeLabel, { color: colors.subText }]}>BẮT ĐẦU</Text>
                    <TextInput
                      style={[styles.timeInput, { color: colors.text }]}
                      placeholder="HH:MM"
                      placeholderTextColor={colors.subText}
                      value={startTime}
                      editable={false}
                      pointerEvents="none"
                      textAlign="center"
                    />
                  </View>
                </TouchableOpacity>

                <MaterialCommunityIcons name="arrow-right-thin" size={24} color={colors.subText} />

                {/* End Time */}
                <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
                  <View style={[styles.timeBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.timeLabel, { color: colors.subText }]}>KẾT THÚC</Text>
                    <TextInput
                      style={[styles.timeInput, { color: colors.text }]}
                      placeholder="HH:MM"
                      placeholderTextColor={colors.subText}
                      value={endTime}
                      editable={false}
                      pointerEvents="none"
                      textAlign="center"
                    />
                  </View>
                </TouchableOpacity>
              </View>

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

              {/* Reason Section */}
              <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Lý do OT</Text>
              <View style={[styles.reasonContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.reasonInput, { color: colors.text }]}
                  placeholder="Nhập lý do chi tiết (VD: Fix bug gấp, release...)"
                  placeholderTextColor={colors.subText}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                />
              </View>

              {/* Policy Note */}
              <View style={[styles.infoRow, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <MaterialCommunityIcons name="information-outline" size={20} color="#8B5CF6" />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  OT sẽ được tính hệ số 1.5 vào ngày thường và 2.0 vào cuối tuần/ngày lễ.
                </Text>
              </View>

            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: '#8B5CF6' }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {initialData ? 'CẬP NHẬT' : 'GỬI ĐĂNG KÝ'}
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
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeBlock: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  timeInput: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 0,
    width: '100%',
  },
  reasonContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    height: 120,
  },
  reasonInput: {
    fontSize: 16,
    height: '100%',
    textAlignVertical: 'top',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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

export default OvertimeRequestSheet;
