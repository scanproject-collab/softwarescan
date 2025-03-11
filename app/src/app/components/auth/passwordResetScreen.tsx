import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

const PasswordResetScreen = () => {
    const { email, resetCode } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useRouter();

    const handleSubmit = async () => {
        if (!newPassword || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Preencha todos os campos',
                position: 'top',
            });
            return;
        }

        if (newPassword.length < 8) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'A senha deve ter pelo menos 8 caracteres',
                position: 'top',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'As senhas não coincidem',
                position: 'top',
            });
            return;
        }

        if (!email || !resetCode) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Dados de e-mail ou código não encontrados. Tente novamente.',
                position: 'top',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/password-recovery/reset`, {
                email: email as string,
                resetCode: resetCode as string,
                newPassword,
            });
            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Sucesso',
                    text2: 'Senha redefinida com sucesso! Redirecionando para login.',
                    position: 'top',
                });
                navigation.push('/pages/auth');
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: error.response?.data?.message || 'Erro ao redefinir a senha',
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Redefinir Senha</Text>
            <Text style={styles.instruction}>
                Digite sua nova senha e confirme-a:
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Nova senha"
                placeholderTextColor="#9E9E9E"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                placeholderTextColor="#9E9E9E"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8} style={styles.submitButton} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? 'Salvando...' : 'Salvar nova senha'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.back()} activeOpacity={0.8} style={styles.backButton} disabled={loading}>
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <Spinner visible={loading} textContent={'Carregando...'} textStyle={styles.spinnerText} />
            <Toast />
        </View>
    );
};

export default PasswordResetScreen;

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