import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Operator {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  institution: string;
  postsCount: number;
  createdAt: string;
}

interface OperatorDetails {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  institution: string | { id: string; title: string };
  postsCount: number;
  createdAt: string;
  posts: {
    id: string;
    title: string;
    createdAt: string;
    ranking: number | string | { id: string; title: string };
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
  });

  useEffect(() => {
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'MANAGER')) {
      navigate('/login');
      return;
    }
    
    fetchOperators();
  }, [token, user, navigate]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'MANAGER' 
        ? '/manager/operators' 
        : '/admin/operators';
      
      const response = await api.get(endpoint);
      setOperators(response.data.operators);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar operadores');
    } finally {
      setLoading(false);
    }
  };

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
        (post) => post.author && post.author.id === operatorId
      );
      
      // Update the operator object with posts and correct count
      const updatedOperator = {
        ...operator,
        posts: operatorPosts,
        postsCount: operatorPosts.length
      };
      
      setSelectedOperator(updatedOperator);
      
      // Use the isActive field from the API if available, otherwise use a sensible default
      const isActive = 
        operator.isActive !== undefined ? operator.isActive : 
        operator.lastLoginDate ? true : 
        !operator.isPending;
      
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
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        isActive: formData.isActive,
      };

      if (formData.password) {
        updateData['password'] = formData.password;
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

  if (loading && operators.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6 flex justify-center items-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Operadores</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Operadores */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-blue-600 text-white font-semibold">
              Lista de Operadores
            </div>
            <div className="p-4">
              {operators.length === 0 ? (
                <p className="text-gray-500">Nenhum operador encontrado.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {operators.map((operator) => (
                    <li 
                      key={operator.id} 
                      className="py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewOperator(operator.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{operator.name}</p>
                          <p className="text-sm text-gray-500">{operator.email}</p>
                          <p className="text-xs text-gray-400">{typeof operator.institution === 'object' && operator.institution ? operator.institution.title : operator.institution}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${operator.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {operator.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Detalhes do Operador */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            {selectedOperator ? (
              <div>
                <div className="p-4 bg-blue-600 text-white font-semibold flex justify-between items-center">
                  <h2>Detalhes do Operador</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleEditOperator}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={handleDeleteOperator}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-600 text-sm">Nome:</p>
                      <p className="font-medium">{selectedOperator.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Email:</p>
                      <p className="font-medium">{selectedOperator.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status:</p>
                      <p className={`font-medium ${selectedOperator.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedOperator.isActive ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Instituição:</p>
                      <p className="font-medium">
                        {typeof selectedOperator.institution === 'object' 
                          ? selectedOperator.institution.title 
                          : selectedOperator.institution}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Cadastrado em:</p>
                      <p className="font-medium">{new Date(selectedOperator.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total de Posts:</p>
                      <p className="font-medium">{selectedOperator.postsCount}</p>
                    </div>
                  </div>

                  {/* Posts do Operador */}
                  <div>
                    <h3 className="font-semibold mb-2">Posts do Operador</h3>
                    {selectedOperator.posts && selectedOperator.posts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Título</th>
                              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Data</th>
                              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Ranking</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOperator.posts.map((post) => (
                              <tr key={post.id} className="border-t border-gray-200">
                                <td className="py-2 px-4">{post.title}</td>
                                <td className="py-2 px-4">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</td>
                                <td className="py-2 px-4">
                                  {typeof post.ranking === 'object' 
                                    ? post.ranking.title || 'N/A' 
                                    : post.ranking}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">Nenhum post encontrado para este operador.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 flex justify-center items-center h-full">
                <p className="text-gray-500">Selecione um operador para ver os detalhes.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Editar Operador</h2>
            <form onSubmit={handleUpdateOperator}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Nome:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
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
                  className="w-full border border-gray-300 rounded p-2"
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
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Deixe em branco para manter a senha atual"
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
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
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
            <p className="mb-6">
              Tem certeza que deseja excluir o operador "{selectedOperator?.name}"? 
              Esta ação não pode ser desfeita e também excluirá todos os posts associados a este operador.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteOperator}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorManagement;