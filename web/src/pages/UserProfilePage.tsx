import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Building, MapPin, Clock, FileText, ChevronLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../shared/services/api';
import MainLayout from '../layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LoadingSpinner from '../shared/components/ui/LoadingSpinner';
import { showError } from '../shared/utils/errorHandler';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: {
    id: string;
    title: string;
  } | string;
  createdAt: string;
  postsCount: number;
}

interface UserPost {
  id: string;
  title: string;
  content?: string;
  tags?: string[];
  imageUrl?: string;
  createdAt: string;
  ranking?: string;
  weight?: number;
  latitude?: number;
  longitude?: number;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !token) return;

      setLoading(true);
      setError(null);

      try {
        // Determine if the current user is ADMIN or MANAGER to use correct API path
        const basePath = user?.role === 'ADMIN' ? '/admin' : '/managers';

        // Fetch user profile
        const userResponse = await api.get(`${basePath}/operators/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = userResponse.data.operator;

        // Fetch posts for this user
        const postsResponse = await api.get(`${basePath}/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Filter posts for the selected user
        const userPosts = (postsResponse.data.posts || []).filter(
          (post: any) => post.author && post.author.id === userId
        );

        setProfileData({
          id: userData.id,
          name: userData.name || 'Unnamed User',
          email: userData.email,
          role: userData.role || 'OPERATOR',
          institution: userData.institution,
          createdAt: userData.createdAt,
          postsCount: userPosts.length
        });

        setUserPosts(userPosts);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'Failed to load user profile');
        showError(err.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token, user?.role]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const getWeightBadgeColor = (weight: string | number | undefined) => {
    const weightValue = parseFloat(String(weight)) || 0;
    if (weightValue >= 350) return "bg-red-500 text-white";
    if (weightValue >= 150) return "bg-orange-500 text-white";
    return "bg-yellow-500 text-black";
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <LoadingSpinner size="lg" text="Carregando perfil..." color="primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !profileData) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow p-8 max-w-md mx-auto">
            <div className="text-red-500 text-center mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold mt-4">Erro ao carregar o perfil</h2>
              <p className="mt-2">{error || 'Usuário não encontrado'}</p>
            </div>
            <button
              onClick={handleBackClick}
              className="mt-4 flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <button
          onClick={handleBackClick}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-5 w-5" />
          Voltar
        </button>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-blue-600 text-2xl font-bold">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profileData.name}</h1>
                <p className="text-blue-100">{profileData.role === 'OPERATOR' ? 'Operador' : (profileData.role === 'MANAGER' ? 'Gestor' : 'Administrador')}</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="info" className="p-6">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="posts">Postagens ({profileData.postsCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <div className="flex items-start">
                  <User className="text-blue-500 h-5 w-5 mt-0.5 mr-3" />
                  <div>
                    <p className="text-gray-600 text-sm">Nome:</p>
                    <p className="font-medium text-gray-800">{profileData.name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="text-blue-500 h-5 w-5 mt-0.5 mr-3" />
                  <div>
                    <p className="text-gray-600 text-sm">Email:</p>
                    <p className="font-medium text-gray-800">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building className="text-blue-500 h-5 w-5 mt-0.5 mr-3" />
                  <div>
                    <p className="text-gray-600 text-sm">Instituição:</p>
                    <p className="font-medium text-gray-800">
                      {typeof profileData.institution === 'object'
                        ? profileData.institution.title
                        : profileData.institution || 'Não vinculado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="text-blue-500 h-5 w-5 mt-0.5 mr-3" />
                  <div>
                    <p className="text-gray-600 text-sm">Data de Registro:</p>
                    <p className="font-medium text-gray-800">{formatDate(profileData.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FileText className="text-blue-500 h-5 w-5 mt-0.5 mr-3" />
                  <div>
                    <p className="text-gray-600 text-sm">Total de Postagens:</p>
                    <p className="font-medium text-gray-800">{profileData.postsCount}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="posts">
              {userPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {userPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      <div className="p-4 relative">
                        {post.weight !== undefined && (
                          <div className="absolute top-2 right-2">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getWeightBadgeColor(post.weight)}`}
                            >
                              Peso: {post.weight || "0"}
                            </span>
                          </div>
                        )}

                        <div className="mb-3">
                          <h3 className="font-semibold text-lg">{post.title || "Sem título"}</h3>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDateTime(post.createdAt)}</span>
                          </div>
                        </div>

                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-40 object-cover rounded-lg mb-3"
                          />
                        ) : (
                          <div className="w-full h-28 bg-gray-100 rounded-lg mb-3"></div>
                        )}

                        {post.content && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {post.content}
                          </p>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {post.ranking && (
                          <div className="text-sm text-gray-600">
                            Prioridade: <span className="font-medium">{post.ranking}</span>
                          </div>
                        )}

                        {post.latitude && post.longitude && (
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>Localização disponível</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Nenhuma postagem encontrada</h3>
                  <p className="text-gray-500 mt-1">Este usuário ainda não realizou nenhuma postagem.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage; 