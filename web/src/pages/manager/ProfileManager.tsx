import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ProfileManager: React.FC = () => {
    const { user, token, updateUserData } = useAuth();
    const navigate = useNavigate();
    const [managerData, setManagerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!token || user?.role !== "MANAGER") {
            navigate("/login");
            return;
        }

        setManagerData({
            name: user?.name,
            email: user?.email,
            role: user?.role,
            institution: user?.institution?.title || "Sem instituição",
        });

        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });

        setLoading(false);
    }, [token, user, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            name: '',
            email: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
            valid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
            valid = false;
        }

        // Validação de senha apenas se o usuário estiver tentando alterar a senha
        if (formData.newPassword || formData.confirmPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Senha atual é obrigatória para alterar a senha';
                valid = false;
            }

            if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
                valid = false;
            }

            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'As senhas não coincidem';
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            // Preparar dados para envio
            const updateData: any = {
                name: formData.name,
                email: formData.email,
            };

            // Adicionar senha apenas se a atual for fornecida
            if (formData.currentPassword) {
                updateData.currentPassword = formData.currentPassword;
                if (formData.newPassword) {
                    updateData.newPassword = formData.newPassword;
                }
            }

            // Enviar requisição para atualizar o perfil
            const response = await api.put('/auth/update-profile', updateData);

            // Atualizar dados do usuário no contexto de autenticação
            if (response.data.user) {
                updateUserData(response.data.user);
            }

            toast.success('Perfil atualizado com sucesso!');
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Perfil do Manager</h1>
                <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                    {!isEditing ? (
                        // Modo visualização
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Nome:</label>
                                <p className="text-gray-900">{managerData?.name || "Unnamed"}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Email:</label>
                                <p className="text-gray-900">{managerData?.email}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Role:</label>
                                <p className="text-gray-900">{managerData?.role}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Instituição:</label>
                                <p className="text-gray-900">{managerData?.institution}</p>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            >
                                Editar Perfil
                            </button>
                        </>
                    ) : (
                        // Modo edição
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Nome:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Senha Atual (necessária para alterações):</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                />
                                {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Nova Senha (opcional):</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                />
                                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Confirmar Nova Senha:</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                                    disabled={loading}
                                >
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="mt-4 w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileManager;