import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';

const StatusFilter = ({ filters, selectedFilter, onSelectFilter }) => {
  return (
    <View style={styles.filterContainer}>
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
              ]}
              onPress={() => onSelectFilter(item.key)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterLabel,
                isActive ? styles.activeFilterLabel : styles.inactiveFilterLabel,
              ]}>
                {item.label}
              </Text>
              {item.count !== undefined && (
                <View style={[
                  styles.countBadge,
                  isActive ? styles.activeCountBadge : styles.inactiveCountBadge,
                ]}>
                  <Text style={[
                    styles.countText,
                    isActive ? styles.activeCountText : styles.inactiveCountText,
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

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  inactiveFilterChip: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterLabel: {
    color: '#FFFFFF',
  },
  inactiveFilterLabel: {
    color: '#6B7280',
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
    backgroundColor: '#E5E7EB',
  },
  countText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeCountText: {
    color: '#FFFFFF',
  },
  inactiveCountText: {
    color: '#374151',
  },
});

export default StatusFilter;
