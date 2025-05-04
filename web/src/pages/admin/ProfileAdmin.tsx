import React, { useState, useEffect } from "react";
import { useProfile } from "../../features/profile/hooks/useProfile";
import MainLayout from "../../layouts/MainLayout";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, UserX, Bell, ChartPie, Settings } from "lucide-react";
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

interface AdminStats {
  totalOperators: number;
  approvedOperators: number;
  rejectedOperators: number;
  pendingOperators: number;
  totalManagers: number;
  totalNotifications: number;
  recentActivity: ActivityItem[];
}

const ProfileAdmin: React.FC = () => {
  const { user } = useProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<AdminStats>({
    totalOperators: 0,
    approvedOperators: 0,
    rejectedOperators: 0,
    pendingOperators: 0,
    totalManagers: 0,
    totalNotifications: 0,
    recentActivity: []
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        // Fetch operators data
        const operatorsResponse = await api.get('/admin/operators');
        const operatorsData = operatorsResponse.data;

        // Fetch pending operators
        const pendingResponse = await api.get('/admin/operators/pending');
        const pendingOperators = pendingResponse.data.operators || [];

        // Fetch managers data
        const managersResponse = await api.get('/admin/managers');
        const managersData = managersResponse.data;

        // Fetch notifications
        const notificationsResponse = await api.get('/admin/notifications');
        const notifications = notificationsResponse.data.notifications || [];

        // Get recent activity (approvals/rejections) from notifications
        const actionNotifications = notifications
          .filter((n: ActivityItem) => ['approved', 'rejected'].includes(n.type))
          .slice(0, 10);

        setStats({
          totalOperators: operatorsData.summary?.totalOperators || 0,
          approvedOperators: operatorsData.operators?.length || 0,
          rejectedOperators: notifications.filter((n: ActivityItem) => n.type === 'rejected').length || 0,
          pendingOperators: pendingOperators.length || 0,
          totalManagers: managersData.summary?.totalManagers || 0,
          totalNotifications: notifications.length || 0,
          recentActivity: actionNotifications
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
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
          <LoadingSpinner size="lg" text="Carregando dados do admin..." color="primary" />
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
                <p className="text-gray-600">Função: <span className="font-semibold">Administrador</span></p>
                <p className="text-gray-600">Cadastrado em: {formatDate(user.createdAt)}</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/update")}
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

          {/* Rejected Operators */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <UserX className="h-8 w-8" />
              </div>
              <div>
                <p className="text-gray-500">Operadores Rejeitados</p>
                <h4 className="text-2xl font-semibold">{stats.rejectedOperators}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Second row stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Managers */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <p className="text-gray-500">Total de Gerentes</p>
                <h4 className="text-2xl font-semibold">{stats.totalManagers}</h4>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => navigate("/managers")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todos os gerentes →
              </button>
            </div>
          </div>

          {/* Notifications Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Bell className="h-8 w-8" />
              </div>
              <div>
                <p className="text-gray-500">Total de Notificações</p>
                <h4 className="text-2xl font-semibold">{stats.totalNotifications}</h4>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Veja todas as notificações clicando no ícone de sino no topo da página.</p>
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
                    <tr key={index} className={activity.type === 'rejected' ? 'bg-red-50' : activity.type === 'approved' ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.type === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : activity.type === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                          }`}>
                          {activity.type === 'approved' ? 'Aprovado' : activity.type === 'rejected' ? 'Rejeitado' : activity.type}
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

export default ProfileAdmin;
