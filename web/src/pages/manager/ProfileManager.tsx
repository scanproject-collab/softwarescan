import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfileManager: React.FC = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [managerData, setManagerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || user?.role !== "MANAGER") {
            navigate("/login");
            return;
        }

        setManagerData({
            name: user?.name,
            email: user?.email,
            role: user?.role,
            institution: user?.institution?.title  || "Sem instituição",
        });
        setLoading(false);
    }, [token, user, navigate]);

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
                        onClick={() => toast.error("Funcionalidade de atualização ainda não implementada para Manager")}
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Atualizar Perfil (Em Breve)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileManager;