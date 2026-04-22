import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const StatCard = ({ title, value, icon, color, onPress, hint }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const CardContent = (
    <>
      <View style={[styles.statIconWrapper, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.subText }]}>{title}</Text>
      {hint && <Text style={[styles.statHint, { color: colors.subText }]}>{hint}</Text>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.statCard, { backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      {CardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3,
    textAlign: 'center',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  statHint: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
    marginTop: 3,
    fontWeight: '400',
  },
});

export default StatCard;
