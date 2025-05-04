import React, { useState, useEffect } from "react";
import { useProfile } from "../../features/profile/hooks/useProfile";
import MainLayout from "../../layouts/MainLayout";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, FileText, Building, Settings, ChevronRight } from "lucide-react";
import api from "../../shared/services/api";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";

interface ActivityItem {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    userInfo?: {
        name?: string;
        institution?: string;
    } | null;
}

interface OperatorStatusCount {
    status: string;
    count: number;
}

interface ManagerStats {
    totalOperators: number;
    approvedOperators: number;
    rejectedOperators: number;
    pendingOperators: number;
    totalPosts: number;
    recentActivity: ActivityItem[];
    operatorsByStatus: OperatorStatusCount[];
}

const ProfileManager: React.FC = () => {
    const { user } = useProfile();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState<ManagerStats>({
        totalOperators: 0,
        approvedOperators: 0,
        rejectedOperators: 0,
        pendingOperators: 0,
        totalPosts: 0,
        recentActivity: [],
        operatorsByStatus: []
    });

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchManagerStats = async () => {
            try {
                setLoading(true);
                // Fetch operators data
                const operatorsResponse = await api.get('/managers/operators');
                const operators = operatorsResponse.data.operators || [];

                // Fetch pending operators
                const pendingResponse = await api.get('/managers/operators/pending');
                const pendingOperators = pendingResponse.data.operators || [];

                // Fetch posts data
                const postsResponse = await api.get('/managers/posts');
                const posts = postsResponse.data.posts || [];

                // Fetch notifications for activity
                const notificationsResponse = await api.get('/managers/notifications');
                const notifications = notificationsResponse.data.notifications || [];

                // Get recent activity from notifications
                const actionNotifications = notifications
                    .filter((n: ActivityItem) => ['approved', 'rejected', 'profile_updated'].includes(n.type))
                    .slice(0, 10);

                // Group operators by status
                const approved = operators.filter((op: any) => !op.isPending).length;
                const pending = pendingOperators.length;

                // Get rejected count from notifications
                const rejected = notifications.filter((n: ActivityItem) => n.type === 'rejected').length;

                setStats({
                    totalOperators: operators.length,
                    approvedOperators: approved,
                    rejectedOperators: rejected,
                    pendingOperators: pending,
                    totalPosts: posts.length,
                    recentActivity: actionNotifications,
                    operatorsByStatus: [
                        { status: 'Aprovados', count: approved },
                        { status: 'Pendentes', count: pending },
                        { status: 'Rejeitados', count: rejected }
                    ]
                });
            } catch (error) {
                console.error("Error fetching manager stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchManagerStats();
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    const formatDate = (dateString?: string): string => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                    <LoadingSpinner size="lg" text="Carregando dados do gerente..." color="primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-100 p-6">
                <Toaster position="top-right" />

                {/* Profile Header */}
                <div className="mb-8 bg-white shadow rounded-lg p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between">
                        <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
                            <div className="w-24 h-24 bg-blue-600 text-white flex items-center justify-center text-4xl font-bold rounded-full mb-4 md:mb-0 md:mr-6">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-gray-600">Função: <span className="font-semibold">Gerente</span></p>
                                <p className="text-gray-600">Instituição: <span className="font-semibold">{user.institution?.title || 'Não atribuída'}</span></p>
                                <p className="text-gray-600">Cadastrado em: {formatDate(user.createdAt)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/managers/update")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                        >
                            <Settings className="h-5 w-5 mr-2" />
                            Editar Perfil
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Operators */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                <Users className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-gray-500">Total de Operadores</p>
                                <h4 className="text-2xl font-semibold">{stats.totalOperators}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Approved Operators */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                <UserCheck className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-gray-500">Operadores Aprovados</p>
                                <h4 className="text-2xl font-semibold">{stats.approvedOperators}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Pending Operators */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                                <Users className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-gray-500">Operadores Pendentes</p>
                                <h4 className="text-2xl font-semibold">{stats.pendingOperators}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Total Posts */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                                <FileText className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-gray-500">Total de Ocorrências</p>
                                <h4 className="text-2xl font-semibold">{stats.totalPosts}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Institution and Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Institution Info */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                <Building className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-gray-500">Sua Instituição</p>
                                <h4 className="text-2xl font-semibold">{user.institution?.title || 'Não atribuída'}</h4>
                            </div>
                        </div>

                        {user.institution ? (
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">Você gerencia operadores desta instituição.</p>
                            </div>
                        ) : (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-700 text-sm">
                                <p>Você não está vinculado a nenhuma instituição. Contate um administrador.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Acesso Rápido</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => navigate("/operators")}
                                className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition"
                            >
                                <span className="flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                                    Gerenciar Operadores
                                </span>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>

                            <button
                                onClick={() => navigate("/tags")}
                                className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition"
                            >
                                <span className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                                    Gerenciar Tags
                                </span>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>

                            <button
                                onClick={() => navigate("/polygons")}
                                className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition"
                            >
                                <span className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                                    Gerenciar Polígonos
                                </span>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>

                    {stats.recentActivity.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mensagem
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Data
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.recentActivity.map((activity, index) => (
                                        <tr key={index} className={
                                            activity.type === 'rejected' ? 'bg-red-50' :
                                                activity.type === 'approved' ? 'bg-green-50' :
                                                    activity.type === 'profile_updated' ? 'bg-blue-50' : ''
                                        }>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.type === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : activity.type === 'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {activity.type === 'approved' ? 'Aprovado' :
                                                        activity.type === 'rejected' ? 'Rejeitado' :
                                                            activity.type === 'profile_updated' ? 'Perfil Atualizado' :
                                                                activity.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {activity.message}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(activity.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">Nenhuma atividade recente encontrada.</p>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfileManager;