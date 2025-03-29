import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

const PasswordResetCodeVerificationScreen = () => {
    const { email } = useLocalSearchParams();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useRouter();

    const handleSubmit = async () => {
        if (code.length !== 6 || !/^[0-9a-fA-F]+$/.test(code)) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Digite um código de 6 dígitos válido',
                position: 'top',
            });
            return;
        }

        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'E-mail não fornecido. Tente novamente.',
                position: 'top',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/password-recovery/verify-code`, {
                email: email as string,
                resetCode: code,
            });
            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Sucesso',
                    text2: 'Código verificado! Redirecionando para redefinir a senha.',
                    position: 'top',
                });
                navigation.push({ pathname: '/pages/auth/PasswordResetScreen', params: { email: email as string, resetCode: code } });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: error.response?.data?.message || 'Código inválido ou expirado',
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verificação de Código</Text>
            <Text style={styles.instruction}>
                Digite o código de 6 dígitos enviado para {'\n'}
                <Text style={styles.emailHighlight}>{email || 'seu e-mail'}</Text>.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Código de 6 dígitos"
                placeholderTextColor="#9E9E9E"
                value={code}
                onChangeText={setCode}
                keyboardType="default"
                maxLength={6}
            />
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8} style={styles.submitButton} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? 'Verificando...' : 'Verificar Código'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.back()} activeOpacity={0.8} style={styles.backButton} disabled={loading}>
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <Spinner visible={loading} textContent={'Carregando...'} textStyle={styles.spinnerText} />
            <Toast />
        </View>
    );
};

export default PasswordResetCodeVerificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F56C2E',
        marginBottom: 20,
    },
    instruction: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    emailHighlight: {
        color: '#00A86B',
        fontWeight: 'bold',
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
    submitButton: {
        width: '100%',
        backgroundColor: '#F56C2E',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
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
    spinnerText: {
        color: '#fff',
    },
});