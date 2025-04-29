import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Activity, Building, Calendar, FileText, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Operator {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  institution: string | { id: string; title: string };
  postsCount: number;
  createdAt: string;
  lastLoginDate?: string;
}

interface OperatorDetails {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  institution: string | { id: string; title: string };
  postsCount: number;
  createdAt: string;
  lastLoginDate?: string;
  posts: {
    id: string;
    title: string;
    content?: string;
    createdAt: string;
    ranking: number | string | { id: string; title: string };
    tags?: any[];
    location?: string;
  }[];
}

const OperatorManagement: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<OperatorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPostsExpanded, setIsPostsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOperators, setTotalOperators] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [searchTerm, /*setSearchTerm*/] = useState('');
  const [filterInstitution, setFilterInstitution] = useState<string>('');
  // Commented out unused variable
  // const [institutions, setInstitutions] = useState<Array<{ id: string, title: string }>>([]);
  // Debounce search to avoid too many API calls
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterInstitution]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Only ADMIN and MANAGER roles can access this page
    if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
      navigate('/');
      toast.error('Você não tem permissão para acessar esta página');
      return;
    }

    fetchOperators();

    // Only admins can see and select institutions
    if (user?.role === 'ADMIN') {
      fetchInstitutions();
    } else if (user?.role === 'MANAGER') {
      // Managers should only see operators from their own institution
      // So reset any institution filter
      setFilterInstitution(user?.institutionId || '');
    }
  }, [token, user, navigate, currentPage, debouncedSearch, filterInstitution, pageSize]);

  // Fetch institutions if needed
  const fetchInstitutions = async () => {
    try {
      // Commenting out the unused response variable
      await api.get('/admin/institutions');
      // setInstitutions(response.data.institutions || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar instituições');
    }
  };

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'MANAGER'
        ? '/manager/operators'
        : '/admin/operators';

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      // For admin, apply institution filter if selected
      // For manager, the backend already filters by the manager's institution
      if (user?.role === 'ADMIN' && filterInstitution) {
        params.append('institutionId', filterInstitution);
      }

      const response = await api.get(`${endpoint}?${params.toString()}`);

      // Update pagination data
      setOperators(response.data.operators || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages || 1);
        setTotalOperators(response.data.pagination.total || 0);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar operadores');
    } finally {
      setLoading(false);
    }
  };

  // New pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Filter handlers - commented out since they're unused
  /*
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInstitutionFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Only allow admins to change institution filter
    if (user?.role === 'ADMIN') {
      setFilterInstitution(e.target.value);
    }
  };
  */

  const fetchOperatorDetails = async (operatorId: string) => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'MANAGER'
        ? `/manager/operators/${operatorId}`
        : `/admin/operators/${operatorId}`;

      const response = await api.get(endpoint);
      const operator = response.data.operator;

      // Fetch all posts
      const postsResponse = await api.get(user?.role === 'MANAGER'
        ? '/manager/listAllPosts'
        : '/admin/listAllPosts'
      );

      // Filter posts for the selected operator
      const operatorPosts = (postsResponse.data.posts || []).filter(
        (post: any) => post.author && post.author.id === operatorId
      );

      // Update the operator object with posts and correct count
      const updatedOperator = {
        ...operator,
        posts: operatorPosts,
        postsCount: operatorPosts.length
      };

      setSelectedOperator(updatedOperator);

      // Determine if the operator is active based on login date (consider active if logged in within the last 30 days)
      const isLoginRecent = operator.lastLoginDate ?
        (new Date().getTime() - new Date(operator.lastLoginDate).getTime()) < (30 * 24 * 60 * 60 * 1000) :
        false;

      const isActive =
        operator.isActive !== undefined ? operator.isActive :
          isLoginRecent;

      setFormData({
        name: operator.name,
        email: operator.email,
        password: '',
        isActive: isActive,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar detalhes do operador');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOperator = (operatorId: string) => {
    fetchOperatorDetails(operatorId);
    setIsPostsExpanded(false);
  };

  const handleEditOperator = () => {
    if (!selectedOperator) return;
    setIsEditModalOpen(true);
  };

  const handleDeleteOperator = () => {
    if (!selectedOperator) return;
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleUpdateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperator) return;

    try {
      setLoading(true);
      const endpoint = user?.role === 'MANAGER'
        ? `/manager/operators/${selectedOperator.id}`
        : `/admin/operators/${selectedOperator.id}`;

      const updateData: {
        name: string;
        email: string;
        isActive: boolean;
        password?: string;
      } = {
        name: formData.name,
        email: formData.email,
        isActive: formData.isActive,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await api.put(endpoint, updateData);
      toast.success('Operador atualizado com sucesso');
      setIsEditModalOpen(false);
      fetchOperators();
      setSelectedOperator(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar operador');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteOperator = async () => {
    if (!selectedOperator) return;

    try {
      setLoading(true);
      const endpoint = user?.role === 'MANAGER'
        ? `/manager/operators/${selectedOperator.id}`
        : `/admin/operators/${selectedOperator.id}`;

      await api.delete(endpoint);
      toast.success('Operador excluído com sucesso');
      setIsDeleteModalOpen(false);
      fetchOperators();
      setSelectedOperator(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir operador');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Function to determine if an operator is active based on login date
  const isOperatorActive = (operator: Operator) => {
    if (operator.isActive !== undefined) return operator.isActive;

    // Check if the operator has logged in within the last 30 days
    if (operator.lastLoginDate) {
      const lastLogin = new Date(operator.lastLoginDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return lastLogin >= thirtyDaysAgo;
    }

    return false;
  };

  // Function to get post tag names
  const getPostTags = (post: any) => {
    if (!post.tags || post.tags.length === 0) return 'Sem tags';

    return post.tags.map((tag: any) =>
      typeof tag === 'string' ? tag : tag.name
    ).join(', ');
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex-grow p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              {loading ? 'Carregando...' : `Total: ${totalOperators} operadores`}
            </div>
            <div>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="p-1 border border-gray-300 rounded-md"
              >
                <option value="5">5 por página</option>
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Lista de operadores */}
            <div className="md:w-1/2 w-full bg-white rounded-lg shadow p-4">
              {loading && operators.length === 0 ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
              ) : operators.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <User className="h-12 w-12 text-gray-300 mb-2" />
                  <p>Nenhum operador encontrado.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {operators.map((operator) => {
                    const isActive = isOperatorActive(operator);
                    return (
                      <li
                        key={operator.id}
                        className={`py-3 px-2 cursor-pointer transition-colors duration-150 rounded-md ${selectedOperator?.id === operator.id
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50'
                          }`}
                        onClick={() => handleViewOperator(operator.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{operator.name}</p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-1"></span>
                              {operator.email}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {typeof operator.institution === 'object' && operator.institution
                                ? operator.institution.title
                                : operator.institution}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              <span className={`w-2 h-2 rounded-full mr-1 ${isActive ? 'bg-green-500' : 'bg-red-500'
                                }`}></span>
                              {isActive ? 'Ativo' : 'Inativo'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {operator.postsCount} {operator.postsCount === 1 ? 'post' : 'posts'}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {/* Detalhes do operador selecionado */}
            <div className="md:w-1/2 w-full bg-white rounded-lg shadow p-4">
              {selectedOperator ? (
                <div>
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex justify-between items-center">
                    <h2 className="flex items-center">
                      <Eye className="mr-2 h-5 w-5" />
                      Detalhes do Operador
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditOperator}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors duration-150 flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={handleDeleteOperator}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors duration-150 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="flex items-start">
                        <User className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
                        <div>
                          <p className="text-gray-600 text-sm">Nome:</p>
                          <p className="font-medium text-gray-800">{selectedOperator.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-500 h-5 w-5 mt-0.5 mr-2">@</span>
                        <div>
                          <p className="text-gray-600 text-sm">Email:</p>
                          <p className="font-medium text-gray-800">{selectedOperator.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Activity className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
                        <div>
                          <p className="text-gray-600 text-sm">Status:</p>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isOperatorActive(selectedOperator) ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                            <p className={`font-medium ${isOperatorActive(selectedOperator) ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {isOperatorActive(selectedOperator) ? 'Ativo' : 'Inativo'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Building className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
                        <div>
                          <p className="text-gray-600 text-sm">Instituição:</p>
                          <p className="font-medium text-gray-800">
                            {typeof selectedOperator.institution === 'object'
                              ? selectedOperator.institution.title
                              : selectedOperator.institution}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
                        <div>
                          <p className="text-gray-600 text-sm">Cadastrado em:</p>
                          <p className="font-medium text-gray-800">{formatDate(selectedOperator.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
                        <div>
                          <p className="text-gray-600 text-sm">Último acesso:</p>
                          <p className="font-medium text-gray-800">
                            {selectedOperator.lastLoginDate ? formatDate(selectedOperator.lastLoginDate) : 'Nunca acessou'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FileText className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
                        <div>
                          <p className="text-gray-600 text-sm">Total de Posts:</p>
                          <p className="font-medium text-gray-800">{selectedOperator.postsCount}</p>
                        </div>
                      </div>
                    </div>

                    {/* Posts do Operador */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-500" />
                          Posts do Operador
                        </h3>
                        <button
                          onClick={() => setIsPostsExpanded(!isPostsExpanded)}
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {isPostsExpanded ? 'Mostrar menos' : 'Expandir todos'}
                        </button>
                      </div>
                      {selectedOperator.posts && selectedOperator.posts.length > 0 ? (
                        <div className="bg-white rounded-lg border overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Título</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Data</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tags</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Localização</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Ranking</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedOperator.posts.map((post) => (
                                  <React.Fragment key={post.id}>
                                    <tr className="hover:bg-gray-50 cursor-pointer">
                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{post.title}</div>
                                      </td>
                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{formatDate(post.createdAt)}</div>
                                      </td>
                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{getPostTags(post)}</div>
                                      </td>
                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{post.location || 'N/A'}</div>
                                      </td>
                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeof post.ranking === 'string' && post.ranking === 'Alto'
                                          ? 'bg-red-100 text-red-800'
                                          : typeof post.ranking === 'string' && post.ranking === 'Médio'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                          }`}>
                                          {typeof post.ranking === 'object'
                                            ? post.ranking.title || 'N/A'
                                            : post.ranking || 'Baixo'}
                                        </span>
                                      </td>
                                    </tr>
                                    {isPostsExpanded && post.content && (
                                      <tr className="bg-gray-50">
                                        <td colSpan={5} className="py-2 px-4">
                                          <div className="text-sm text-gray-600">
                                            <span className="font-medium">Conteúdo:</span> {post.content}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Nenhum post encontrado para este operador.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-10">Selecione um operador para ver os detalhes</div>
              )}
            </div>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 border-t pt-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loading}
                className={`flex items-center px-3 py-1 rounded ${currentPage === 1 || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </button>

              <span className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || loading}
                className={`flex items-center px-3 py-1 rounded ${currentPage === totalPages || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
              >
                Próxima <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-500" />
              Editar Operador
            </h2>
            <form onSubmit={handleUpdateOperator}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Nome:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Nova Senha (opcional):</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deixe em branco para manter a senha atual"
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-gray-700 font-semibold">
                  Conta Ativa
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-red-500" />
              Confirmar Exclusão
            </h2>
            <p className="mb-6 text-gray-600">
              Tem certeza que deseja excluir o operador <span className="font-semibold">"{selectedOperator?.name}"</span>?
              Esta ação não pode ser desfeita e também excluirá todos os posts associados a este operador.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteOperator}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-150 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span>Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorManagement;
