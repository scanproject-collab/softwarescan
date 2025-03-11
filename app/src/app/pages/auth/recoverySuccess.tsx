import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

const RecoverySuccessScreen = () => {
  const { email } = useLocalSearchParams(); // Recupera o email dos parâmetros

  return (
      <View style={styles.container}>
        <Image source={require('../../../../assets/images/scan-removebg-preview.png')} style={styles.logo} />
        <Text style={styles.appName}>Scan</Text>
        <Text style={styles.message}>
          Um email foi enviado para {'\n'}
          <Text style={styles.emailHighlight}>{email || 'seu e-mail'}</Text> {'\n'}
          com as instruções para redefinir sua senha.
        </Text>
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/components/auth/CodeVerificationScreen', params: { email } })}
            style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Verificar Código</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Toast />
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
  submitButton: {
    width: '100%',
    backgroundColor: '#F56C2E',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
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