import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const LoadingMore = ({ colors }) => (
  <View style={styles.loadingMore}>
    <Text style={{ color: colors.subText }}>Đang tải thêm...</Text>
  </View>
);

const styles = StyleSheet.create({
   loadingMore: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default LoadingMore;
