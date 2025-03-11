import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

interface DecodedToken {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    institutionId?: string;
    createdAt?: string;
}

const EditProfileScreen = () => {
    const { id } = useLocalSearchParams();
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [institutionId, setInstitutionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'edit' | 'verifyCode' | 'success'>('edit');
    const [resetCode, setResetCode] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                try {
                    const decoded = jwt_decode<DecodedToken>(token);
                    setUser(decoded);
                    setName(decoded.name || '');
                    setEmail(decoded.email || '');
                    setInstitutionId(decoded.institutionId || '');
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleUpdate = async () => {
        if (!name || !email || !email.includes('@')) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Nome e e-mail válido são obrigatórios',
                position: 'top',
            });
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.put(
                `${process.env.EXPO_PUBLIC_API_URL}/operator/update`,
                {
                    name,
                    email,
                    password: password || undefined,
                    institutionId: institutionId || undefined,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.status === 200) {
                // Atualiza o token com o novo retornado
                if (response.data.token) {
                    await AsyncStorage.setItem('userToken', response.data.token);
                }


                if (newPassword) {

                    await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/password-recovery/request`, { email });
                    Toast.show({
                        type: 'success',
                        text1: 'Sucesso',
                        text2: `Um código de verificação foi enviado para ${email}`,
                        position: 'top',
                    });
                    setStep('verifyCode');
                } else {
                    Toast.show({
                        type: 'success',
                        text1: 'Sucesso',
                        text2: 'Perfil atualizado com sucesso!',
                        position: 'top',
                    });
                    router.push('/pages/users/profile');
                }
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: error.response?.data?.message || 'Erro ao atualizar o perfil',
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (resetCode.length !== 6 || !/^[0-9a-fA-F]+$/.test(resetCode)) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Digite um código de 6 dígitos válido',
                position: 'top',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/password-recovery/verify-code`, {
                email: email as string,
                resetCode,
            });
            if (response.status === 200) {
                const updateResponse = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/password-recovery/reset`, {
                    email: email as string,
                    resetCode,
                    newPassword,
                });
                if (updateResponse.status === 200) {
                    Toast.show({
                        type: 'success',
                        text1: 'Sucesso',
                        text2: 'Senha atualizada com sucesso!',
                        position: 'top',
                    });
                    setStep('success');
                    router.push('/pages/users/profile');
                }
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

    if (step === 'verifyCode') {
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
                    value={resetCode}
                    onChangeText={setResetCode}
                    keyboardType="default"
                    maxLength={6}
                />
                <TouchableOpacity onPress={handleVerifyCode} activeOpacity={0.8} style={styles.submitButton} disabled={loading}>
                    <Text style={styles.submitButtonText}>{loading ? 'Verificando...' : 'Verificar Código'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep('edit')} activeOpacity={0.8} style={styles.backButton} disabled={loading}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
                <Spinner visible={loading} textContent={'Carregando...'} textStyle={styles.spinnerText} />
                <Toast />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Perfil</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
            />
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Nova senha (opcional)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />
            {newPassword ? (
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar nova senha"
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    secureTextEntry
                />
            ) : null}
            <TextInput
                style={styles.input}
                placeholder="ID da Instituição (opcional)"
                value={institutionId}
                onChangeText={setInstitutionId}
                keyboardType="numeric"
            />
            <TouchableOpacity onPress={handleUpdate} activeOpacity={0.8} style={styles.submitButton} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.backButton} disabled={loading}>
                <Text style={styles.backButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <Spinner visible={loading} textContent={'Carregando...'} textStyle={styles.spinnerText} />
            <Toast />
        </View>
    );
};

export default EditProfileScreen;

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
    spinnerText: {
        color: '#fff',
    },
});