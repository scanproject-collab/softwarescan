import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/scan.jpg')} style={styles.logo} />
      <Text style={styles.title}>Scan</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#9E9E9E"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9E9E9E"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <TouchableOpacity>
          <Text style={styles.link}>Esqueci a senha</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.link}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F56C2E',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingLeft: 15,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#F56C2E',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  link: {
    color: '#F56C2E',
    fontSize: 16,
  },
});

export default LoginScreen;
