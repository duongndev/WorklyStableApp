import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const OvertimeRequestScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, isDarkMode } = theme;
  const insets = useSafeAreaInsets();

  const [project, setProject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleSubmit = () => {
    console.log('Submit OT request', {
      project,
      date,
      startTime,
      endTime,
      reason
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#8B5CF6', paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký làm thêm</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Project Input */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin công việc</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Ngày làm thêm</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Thời gian làm việc</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Lý do OT</Text>
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

          {/* Total Time */}
          <View style={[styles.timeBlock, styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 15 }]}>
            <Text style={[styles.timeLabel, styles.textInput, { color: colors.subText }]}>TỔNG THỜI GIAN</Text>
            <Text style={[styles.timeValue, styles.textInput, { color: colors.subText }]}>0h00</Text>
          </View>

          {/* Policy Note */}
          <View style={[styles.infoRow, { backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : '#F3E8FF' }]}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#8B5CF6" />
            <Text style={[styles.infoText, { color: colors.text }]}>
              OT sẽ được tính hệ số 1.5 vào ngày thường và 2.0 vào cuối tuần/ngày lễ.
            </Text>
          </View>

        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#8B5CF6', shadowColor: '#8B5CF6' }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>GỬI ĐĂNG KÝ</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default OvertimeRequestScreen;
