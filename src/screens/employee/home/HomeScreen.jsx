import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import Header from '../../../components/common/Header';
import CheckInCard from '../../../components/employee/home/CheckInCard';
import StatCard from '../../../components/common/StatCard';
import QuickActions from '../../../components/employee/home/QuickActions';
import RecentActivities from '../../../components/employee/home/RecentActivities';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, isDarkMode } = theme;
  const [refreshing, setRefreshing] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const today = useMemo(() => {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, []);

  const handleNavigate = useCallback(
    screen => {
      if (screen) navigation.navigate(screen);
    },
    [navigation]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const animateButton = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Header
        username="Nhân viên"
        showNotification
        showLogout
        onNotificationPress={() => navigation.navigate('Notification')}
        unreadCount={2}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
       
        <View style={styles.statsRow}>
          <View style={styles.statCardWrapper}>
            <StatCard
              title="Công tháng"
              value="22/26"
              hint="Còn 4 ngày"
              icon="calendar-check"
              color="#10B981"
            />
          </View>
          <View style={styles.statCardWrapper}>
            <StatCard
              title="Phép còn"
              value="10 ngày"
              hint="Dùng trước 31/12"
              icon="beach"
              color="#3B82F6"
            />
          </View>
          <View style={styles.statCardWrapper}>
            <StatCard
              title="OT tháng"
              value="12 giờ"
              hint="Đã duyệt 8 giờ"
              icon="clock-time-eight"
              color="#F59E0B"
            />
          </View>
        </View>

         <CheckInCard
          isDarkMode={isDarkMode}
          today={today}
          animateButton={animateButton}
          scaleAnim={scaleAnim}
        />


        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hành động nhanh
          </Text>
        </View>

        <QuickActions
          colors={colors}
          onNavigate={handleNavigate}
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hoạt động gần đây
          </Text>
        </View>

        <RecentActivities colors={colors} />
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    height: 120,
  },

  statCardWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },

  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default HomeScreen;
