import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

interface UpdateNotificationProps {
  latestVersion: string;
  isRequired: boolean;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  latestVersion,
  isRequired
}) => {
  const currentVersion = Constants.expoConfig?.version || '0.0.0';

  const handleUpdate = () => {
    // Open the app store or download link
    Linking.openURL('https://softwarescan.vercel.app/download');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="arrow-up-circle" size={24} color="#F56C2E" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {isRequired ? 'Atualização obrigatória disponível!' : 'Nova versão disponível!'}
        </Text>
        <Text style={styles.subtitle}>
          Versão atual: {currentVersion} | Nova versão: {latestVersion}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
      >
        <Text style={styles.buttonText}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#F56C2E',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#F56C2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default UpdateNotification; 