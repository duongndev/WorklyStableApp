import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const CheckInCard = ({ isDarkMode, today, animateButton, scaleAnim }) => {
  const [checkInStatus, setCheckInStatus] = useState('not_checked_in'); // not_checked_in, checked_in, checked_out
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [location] = useState('Văn phòng chính');

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleCheckIn = () => {
    animateButton();
    const currentTime = getCurrentTime();
    setCheckInTime(currentTime);
    setCheckInStatus('checked_in');
    
    Alert.alert(
      'Chấm công thành công',
      `Bạn đã chấm công vào lúc ${currentTime}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleCheckOut = () => {
    animateButton();
    const currentTime = getCurrentTime();
    setCheckOutTime(currentTime);
    setCheckInStatus('checked_out');
    
    Alert.alert(
      'Chấm công ra thành công',
      `Bạn đã chấm công ra lúc ${currentTime}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getStatusBadge = () => {
    switch (checkInStatus) {
      case 'checked_in':
        return {
          icon: 'briefcase-clock-outline',
          text: 'Đang làm việc',
          bgColor: 'rgba(34, 197, 94, 0.2)'
        };
      case 'checked_out':
        return {
          icon: 'check-circle-outline',
          text: 'Đã hoàn thành',
          bgColor: 'rgba(59, 130, 246, 0.2)'
        };
      default:
        return {
          icon: 'clock-outline',
          text: 'Chưa chấm công',
          bgColor: 'rgba(251, 146, 60, 0.2)'
        };
    }
  };

  const getActionButton = () => {
    switch (checkInStatus) {
      case 'checked_in':
        return {
          icon: 'fingerprint',
          text: 'Chấm công ra',
          onPress: handleCheckOut,
          gradientColors: ['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.1)']
        };
      case 'checked_out':
        return {
          icon: 'check-circle',
          text: 'Đã hoàn thành',
          onPress: null,
          gradientColors: ['rgba(156, 163, 175, 0.2)', 'rgba(107, 114, 128, 0.1)']
        };
      default:
        return {
          icon: 'fingerprint',
          text: 'Chấm công vào',
          onPress: handleCheckIn,
          gradientColors: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
        };
    }
  };

  const statusBadge = getStatusBadge();
  const actionButton = getActionButton();

  return (
    <LinearGradient
      colors={
        isDarkMode
          ? ['#6366F1', '#4F46E5']
          : ['#6366F1', '#4F46E5']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.checkinCard}
    >
      <View style={styles.checkinLeft}>
        <View style={styles.checkinHeader}>
          <Text style={styles.checkinLabel}>Hôm nay</Text>
          <View style={[styles.checkinStatusBadge, { backgroundColor: statusBadge.bgColor }]}>
            <MaterialCommunityIcons
              name={statusBadge.icon}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.checkinStatusText}>{statusBadge.text}</Text>
          </View>
        </View>
        
        <Text style={styles.checkinDate}>{today}</Text>
        
        <View style={styles.timeInfo}>
          {checkInTime && (
            <View style={styles.timeRow}>
              <MaterialCommunityIcons name="login" size={14} color="#E5E7EB" />
              <Text style={styles.checkinTime}>Vào ca: {checkInTime}</Text>
            </View>
          )}
          
          {checkOutTime && (
            <View style={styles.timeRow}>
              <MaterialCommunityIcons name="logout" size={14} color="#E5E7EB" />
              <Text style={styles.checkinTime}>Ra ca: {checkOutTime}</Text>
            </View>
          )}
          
          {!checkInTime && !checkOutTime && (
            <View style={styles.timeRow}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#E5E7EB" />
              <Text style={styles.checkinTime}>Chưa chấm công</Text>
            </View>
          )}
        </View>
        
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color="#E5E7EB" />
          <Text style={styles.checkinLocation}>{location}</Text>
        </View>
      </View>

      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity 
          style={[
            styles.checkinButton,
            checkInStatus === 'checked_out' && styles.disabledButton
          ]}
          onPress={actionButton.onPress}
          activeOpacity={0.8}
          disabled={checkInStatus === 'checked_out'}
        >
          <LinearGradient
            colors={actionButton.gradientColors}
            style={styles.checkinIconWrapper}
          >
            <MaterialCommunityIcons
              name={actionButton.icon}
              size={42}
              color="#FFFFFF"
            />
          </LinearGradient>
          <Text style={styles.checkinButtonText}>{actionButton.text}</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  checkinCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  checkinLeft: {
    flex: 1,
    marginRight: 16,
  },

  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  checkinLabel: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },

  checkinDate: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },

  checkinStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  checkinStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  timeInfo: {
    marginBottom: 8,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  checkinTime: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkinLocation: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },

  checkinButton: {
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  checkinIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  checkinButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '700',
  },
});

export default CheckInCard;
