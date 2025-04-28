import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OfflineMessageProps {
  isOffline: boolean;
}

const OfflineMessage = ({ isOffline }: OfflineMessageProps) => {
  if (!isOffline) return null;
  return (
    <View style={styles.offlineMessage}>
      <Text style={styles.offlineText}>Você está offline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  offlineMessage: { backgroundColor: '#ffeb3b', padding: 10, alignItems: 'center' },
  offlineText: { color: '#333', fontWeight: 'bold' },
});

export default OfflineMessage;