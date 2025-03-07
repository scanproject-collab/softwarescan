import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

const RecoveryScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleSubmit = () => {
    if (!email.includes('@')) {
      Alert.alert('Erro', 'Digite um e-mail válido');
      return;
    }

  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#fff' }}>
      
      <Image source={require('../../../../assets/images/scan-removebg-preview.png')} style={{ width: 100, height: 100, marginBottom: 20 }} />
      <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#F56C2E', marginBottom: 30 }}>Scan</Text>
      
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#333' }}>
        Para recuperar sua senha, digite abaixo seu email:
      </Text>
      
      <TextInput
        style={{ width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, paddingLeft: 15, marginBottom: 15 }}
        placeholder="E-mail"
        placeholderTextColor="#9E9E9E"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        />
    
    <TouchableOpacity 
        onPress={handleSubmit} 
        activeOpacity={0.8} 
        style={{ width: '100%', backgroundColor: '#F56C2E', padding: 15, borderRadius: 5, alignItems: 'center' }}
    >
    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Enviar email de recuperação de senha</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      onPress={() => navigation.goBack()} 
      activeOpacity={0.8} 
      style={{ width: '100%', backgroundColor: '#ccc', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 }}
    >
      <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold' }}>Voltar</Text>
    </TouchableOpacity>

    </View>
  );
};


export default RecoveryScreen;