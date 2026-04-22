import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ActivityItem = ({ icon, text, color, colors, time, type, detail }) => {
  return (
    <View style={styles.activityRow}>
      <View
        style={[
          styles.activityIconWrapper,
          { backgroundColor: color + '15', borderColor: color + '40' },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityText, { color: colors.text }]}>
          {text}
        </Text>
        {detail && (
          <Text style={[styles.activityDetail, { color: colors.subText }]}>
            {detail}
          </Text>
        )}
        <View style={styles.activityMetaRow}>
          {type ? (
            <Text
              style={[
                styles.activityTag,
                {
                  color,
                  borderColor: color + '40',
                  backgroundColor: color + '10',
                },
              ]}
            >
              {type}
            </Text>
          ) : null}
          {time ? (
            <Text style={[styles.activityTime, { color: colors.subText }]}>
              {time}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },

  activityIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 12,
  },

  activityContent: {
    flex: 1,
  },

  activityText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  activityDetail: {
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
  },

  activityMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activityTag: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    fontWeight: '600',
  },

  activityTime: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default ActivityItem;
