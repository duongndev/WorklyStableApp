import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const MenuItem = ({
  icon,
  title,
  value,
  onPress,
  showArrow = true,
  color,
  type = 'link',
  count,
}) => {
  const { theme } = useTheme();
  const { colors, isDarkMode } = theme;

  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={type === 'switch' && !onPress}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: color ? color + '15' : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6') },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={color || colors.text}
          />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuItemText, { color: colors.text }]}>{title}</Text>
          {count !== null && count > 0 && (
            <Text style={[styles.menuCount, { color: color || colors.primary }]}>
              {count} chờ duyệt
            </Text>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {type === 'switch' ? (
          <Switch
            value={!!value}
            onValueChange={onPress}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        ) : (
          <>
            {value && (
              <Text style={[styles.menuItemValue, { color: colors.subText }]}>
                {value}
              </Text>
            )}
            {showArrow && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.subText}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuCount: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    marginRight: 8,
  },
});

export default MenuItem;
