import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const StatusFilter = ({ 
  filters, 
  selectedFilter, 
  onSelectFilter, 
  containerStyle,
  showCountBadge = true,
  chipStyle,
  labelStyle,
  countBadgeStyle,
  countTextStyle
}) => {
  const { theme } = useTheme();
  const { colors, isDarkMode } = theme;

  const styles = createStyles(colors, isDarkMode);

  return (
    <View style={[styles.filterContainer, containerStyle]}>
      <FlatList
        horizontal
        data={filters}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        keyExtractor={item => item.key}
        renderItem={({ item }) => {
          const isActive = selectedFilter === item.key;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                isActive ? styles.activeFilterChip : styles.inactiveFilterChip,
                chipStyle
              ]}
              onPress={() => onSelectFilter(item.key)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterLabel,
                isActive ? styles.activeFilterLabel : styles.inactiveFilterLabel,
                labelStyle
              ]}>
                {item.label}
              </Text>
              {showCountBadge && item.count !== undefined && (
                <View style={[
                  styles.countBadge,
                  isActive ? styles.activeCountBadge : styles.inactiveCountBadge,
                  countBadgeStyle
                ]}>
                  <Text style={[
                    styles.countText,
                    isActive ? styles.activeCountText : styles.inactiveCountText,
                    countTextStyle
                  ]}>
                    {item.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  filterContainer: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inactiveFilterChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterLabel: {
    color: '#FFFFFF',
  },
  inactiveFilterLabel: {
    color: colors.secondaryText,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  inactiveCountBadge: {
    backgroundColor: colors.border,
  },
  countText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeCountText: {
    color: '#FFFFFF',
  },
  inactiveCountText: {
    color: colors.primaryText,
  },
});

export default StatusFilter;
