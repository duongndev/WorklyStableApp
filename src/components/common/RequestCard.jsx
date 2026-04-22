import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { STATUS_CONFIG } from '../../utils/statusConfigs';
import { LEAVE_TYPE_CONFIG } from '../../utils/leaveTypeConfigs';

// Utility function to format API data for display
const formatLeaveData = (item) => {
  const leaveTypeConfig = LEAVE_TYPE_CONFIG[item.leaveType] || {
    label: 'Nghỉ phép',
    color: '#3B82F6',
    icon: 'calendar-star'
  };

  // Format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Format date range
  const formatDateRange = () => {
    const startDate = formatDate(item.startDate);
    const endDate = formatDate(item.endDate);
    
    if (startDate === endDate) {
      // Same day - show time if time_based
      if (item.leaveDurationType === 'time_based' && item.startTime && item.endTime) {
        return `${startDate} (${item.startTime} - ${item.endTime})`;
      }
      // Half day
      if (item.leaveDurationType === 'half_day' && item.session) {
        const sessionText = item.session === 'morning' ? 'Buổi sáng' : 'Buổi chiều';
        return `${startDate} (${sessionText})`;
      }
      return startDate;
    } else {
      // Multiple days
      return `${startDate} - ${endDate}`;
    }
  };

  // Format duration text
  const getDurationText = () => {
    if (item.leaveDurationType === 'time_based') {
      return `${item.duration} giờ`;
    } else if (item.leaveDurationType === 'half_day') {
      return 'Nửa ngày';
    } else {
      return `${item.duration} ngày`;
    }
  };

  return {
    ...item,
    label: leaveTypeConfig.label,
    color: leaveTypeConfig.color,
    icon: leaveTypeConfig.icon,
    dateRange: formatDateRange(),
    durationText: getDurationText(),
    createdAt: formatDate(item.createdAt),
    createdTime: formatTime(item.createdAt),
    sender: item.userId?.fullName || 'Unknown',
    days: item.duration,
    approver: item.approvedBy?.fullName,
    approvedAt: item.approvedAt ? formatDate(item.approvedAt) : null,
    approvedTime: item.approvedAt ? formatTime(item.approvedAt) : null
  };
};

const RequestCard = ({ item, onPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const formattedItem = formatLeaveData(item);
  const status = STATUS_CONFIG[formattedItem.status] || STATUS_CONFIG.pending;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress(formattedItem)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <View style={[styles.iconBox, { backgroundColor: formattedItem.color || colors.primary }]}>
            <MaterialCommunityIcons name={formattedItem.icon || 'file-document-outline'} size={20} color="#FFF" />
          </View>
          <View>
            <Text style={[styles.typeLabel, { color: colors.text }]}>{formattedItem.label}</Text>
            <Text style={[styles.dateText, { color: colors.subText }]}>
              {formattedItem.createdAt} • {formattedItem.durationText}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.cardBody}>
        <View style={styles.dateRow}>
          <MaterialCommunityIcons name="calendar-range" size={16} color={colors.subText} />
          <Text style={[styles.rangeText, { color: colors.text }]}>
            {formattedItem.dateRange}
          </Text>
        </View>
        {formattedItem.reason && (
          <Text style={[styles.reasonText, { color: colors.subText }]} numberOfLines={2}>
            {formattedItem.reason}
          </Text>
        )}
        {formattedItem.isPaidLeave !== undefined && (
          <View style={styles.leaveTypeRow}>
            <MaterialCommunityIcons 
              name={formattedItem.isPaidLeave ? 'cash-check' : 'cash-remove'} 
              size={14} 
              color={colors.subText} 
            />
            <Text style={[styles.leaveTypeText, { color: colors.subText }]} >
              {formattedItem.isPaidLeave ? 'Nghỉ có lương' : 'Nghỉ không lương'}
            </Text>
          </View>
        )}
        {formattedItem.approver && (
          <View style={styles.approvalRow}>
            <MaterialCommunityIcons name="account-check" size={14} color={colors.subText} />
            <Text style={[styles.approvalText, { color: colors.subText }]}>
              {formattedItem.approver} • {formattedItem.approvedAt}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
  },
  cardBody: {
    padding: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rangeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  leaveTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  leaveTypeText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  approvalText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default RequestCard;
