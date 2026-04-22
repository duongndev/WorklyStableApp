import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { logoutAction } from '../../../redux/auth/authAction';
import { removeToken, removeFCMToken } from '../../../utils/tokenUtils';
import MenuItem from '../../../components/common/MenuItem';
import Header from '../../../components/common/Header';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { colors, isDarkMode } = theme;
  const { user, loading } = useSelector(state => state.auth);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              // Dispatch logout action để gọi API
              await dispatch(logoutAction());
              
              // Xóa tokens khỏi AsyncStorage
              await Promise.all([
                removeToken(),
                removeFCMToken()
              ]);
              
              // Điều hướng về Login
              navigation.replace('Login');
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
              // Vẫn điều hướng về Login ngay cả khi API lỗi
              navigation.replace('Login');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Header title="Hồ sơ cá nhân" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=0EA5E9&color=fff&size=128&bold=true` }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{user?.fullName || 'Nhân viên'}</Text>
              <Text style={[styles.profileEmail, { color: colors.subText }]}>{user?.email || 'user@workly.com'}</Text>
              <View style={[styles.roleBadge, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}>
                <Text style={[styles.roleText, { color: colors.primary }]}>
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Tài khoản</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <MenuItem icon="account-cog-outline" title="Thông tin cá nhân" onPress={() => { }} />
            <MenuItem
              icon="cash-multiple"
              title="Bảng lương"
              onPress={() => navigation.navigate('Payroll')}
            />
            <MenuItem icon="lock-outline" title="Đổi mật khẩu" onPress={() => { }} />
            <MenuItem icon="shield-check-outline" title="Bảo mật & Quyền riêng tư" onPress={() => { }} />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Cài đặt chung</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <MenuItem
              icon="theme-light-dark"
              title="Chế độ tối"
              type="switch"
              value={isDarkMode}
              onPress={toggleTheme}
            />
            <MenuItem icon="bell-outline" title="Thông báo" showArrow={true} onPress={() => { }} />
            <MenuItem icon="translate" title="Ngôn ngữ" value="Tiếng Việt" onPress={() => { }} />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Hỗ trợ</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <MenuItem icon="help-circle-outline" title="Trung tâm trợ giúp" onPress={() => { }} />
            <MenuItem icon="information-outline" title="Về ứng dụng" value="v1.0.0" onPress={() => { }} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2' }]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size={20} color="#EF4444" />
          ) : (
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          )}
          <Text style={styles.logoutText}>
            {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent', // Will be overridden
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
