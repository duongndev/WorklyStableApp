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

const CreateLeaveScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, isDarkMode } = theme;
  const insets = useSafeAreaInsets();
  
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);

  const leaveTypes = [
    { id: 'annual', label: 'Nghỉ phép năm', icon: 'calendar-star', color: '#3B82F6' },
    { id: 'sick', label: 'Nghỉ ốm', icon: 'medical-bag', color: '#EF4444' },
    { id: 'unpaid', label: 'Không lương', icon: 'cash-off', color: '#F59E0B' },
    { id: 'remote', label: 'Làm từ xa', icon: 'laptop', color: '#10B981' },
    { id: 'other', label: 'Khác', icon: 'dots-horizontal', color: '#8B5CF6' },
  ];

  const currentType = leaveTypes[selectedTypeIndex];

  const handleSubmit = () => {
    console.log('Submit leave request', { 
      type: currentType.label, 
      fromDate, 
      toDate, 
      reason 
    });
    navigation.goBack();
  };

  const cycleType = () => {
    setSelectedTypeIndex((prev) => (prev + 1) % leaveTypes.length);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 1. Dynamic Header / Type Selector Block */}
      <TouchableOpacity 
        style={[
          styles.typeHeader,
          { backgroundColor: currentType.color, paddingTop: insets.top + 10 },
        ]}
        activeOpacity={0.9}
        onPress={cycleType}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đơn xin nghỉ</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.typeContent}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name={currentType.icon} size={40} color={currentType.color} />
          </View>
          <Text style={styles.typeLabel}>{currentType.label}</Text>
          <View style={styles.tapHintContainer}>
            <Text style={styles.tapHint}>Chạm để đổi loại nghỉ</Text>
            <MaterialCommunityIcons name="gesture-tap" size={16} color="rgba(255,255,255,0.7)" />
          </View>
        </View>

        {/* Decorative Wave/Curve at bottom of header */}
        <View style={[styles.curve, { backgroundColor: colors.background }]} />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* 2. Big Date Blocks */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thời gian nghỉ</Text>
          <View style={styles.datesRow}>
            {/* From Date Block */}
            <View style={[styles.dateBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.dateHeader, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                <Text style={[styles.dateLabel, { color: colors.subText }]}>TỪ NGÀY</Text>
              </View>
              <View style={styles.dateInputContainer}>
                <MaterialCommunityIcons name="calendar-arrow-right" size={24} color={currentType.color} style={styles.dateIcon} />
                <TextInput
                  style={[styles.dateInputBig, { color: colors.text }]}
                  placeholder="DD/MM"
                  placeholderTextColor={colors.subText}
                  value={fromDate}
                  onChangeText={setFromDate}
                  textAlign="center"
                />
              </View>
            </View>

            {/* Arrow Divider */}
            <MaterialCommunityIcons name="arrow-right-thin" size={32} color={colors.subText} />

            {/* To Date Block */}
            <View style={[styles.dateBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.dateHeader, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                <Text style={[styles.dateLabel, { color: colors.subText }]}>ĐẾN NGÀY</Text>
              </View>
              <View style={styles.dateInputContainer}>
                <MaterialCommunityIcons name="calendar-arrow-left" size={24} color={currentType.color} style={styles.dateIcon} />
                <TextInput
                  style={[styles.dateInputBig, { color: colors.text }]}
                  placeholder="DD/MM"
                  placeholderTextColor={colors.subText}
                  value={toDate}
                  onChangeText={setToDate}
                  textAlign="center"
                />
              </View>
            </View>
          </View>

          {/* 3. Reason Section */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Lý do</Text>
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

          {/* 4. Quick Info / Status */}
          <View style={[styles.infoRow, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#EBF5FF' }]}>
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Đơn sẽ được gửi đến quản lý trực tiếp phê duyệt.
            </Text>
          </View>

        </ScrollView>

        {/* 5. Big Submit Button */}
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: currentType.color, shadowColor: currentType.color }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>GỬI YÊU CẦU</Text>
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
  // Type Header
  typeHeader: {
    paddingTop: 10,
    paddingBottom: 40, // Space for curve
    alignItems: 'center',
    position: 'relative',
  },
  headerTop: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  typeContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  typeLabel: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tapHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tapHint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  curve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  // Content
  content: {
    padding: 24,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Date Blocks
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateBlock: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    height: 120,
  },
  dateHeader: {
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateInputContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dateIcon: {
    position: 'absolute',
    opacity: 0.1,
    transform: [{ scale: 2.5 }],
  },
  dateInputBig: {
    fontSize: 22,
    fontWeight: 'bold',
    width: '100%',
    padding: 0,
  },
  // Reason
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
  // Info
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
  // Footer
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
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

export default CreateLeaveScreen;
