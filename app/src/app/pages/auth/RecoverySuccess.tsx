import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const RecoverySuccessScreen = () => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image 
        source={require('../../../../assets/images/scan-removebg-preview.png')} 
        style={styles.logo} 
      />

      <Text style={styles.appName}>Scan</Text>

      <Text style={styles.message}>
        Um email foi enviado para {'\n'}
        <Text style={styles.emailHighlight}>exemplo@exemplo.com.br</Text> {'\n'}
        com as instruções para redefinir sua senha.
      </Text>

      <TouchableOpacity 
        onPress={() => router.push('/components/auth/signinScreen')} 
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RecoverySuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F56C2E',
    marginBottom: 30,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  emailHighlight: {
    color: '#00A86B',
    fontWeight: 'bold',
  },
  backButton: {
    width: '100%',
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
