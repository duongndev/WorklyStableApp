import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/common/Header';

const PayrollScreen = () => {
  const payslips = [
    { id: 1, month: 'Tháng 1, 2026', amount: '15,000,000 VNĐ', status: 'paid', date: '05/02/2026' },
    { id: 2, month: 'Tháng 12, 2025', amount: '14,800,000 VNĐ', status: 'paid', date: '05/01/2026' },
    { id: 3, month: 'Tháng 11, 2025', amount: '15,200,000 VNĐ', status: 'paid', date: '05/12/2025' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Bảng lương" canGoBack />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Lương ước tính tháng này</Text>
          <Text style={styles.summaryAmount}>7,500,000 VNĐ</Text>
          <Text style={styles.summaryNote}>Cập nhật đến ngày 13/02</Text>
        </View>

        <Text style={styles.sectionTitle}>Lịch sử lương</Text>

        {payslips.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.monthText}>{item.month}</Text>
              <Text style={styles.statusBadge}>Đã thanh toán</Text>
            </View>
            <View style={styles.cardBody}>
              <View>
                <Text style={styles.label}>Thực nhận</Text>
                <Text style={styles.amount}>{item.amount}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Ngày nhận</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  summaryLabel: {
    color: '#E0E7FF',
    fontSize: 14,
    marginBottom: 8,
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryNote: {
    color: '#C7D2FE',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
  },
});

export default PayrollScreen;
