import { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/services/api';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Operator,
  OperatorDetails,
  FilterParams,
  PaginationMeta
} from '../types/operator.types';

export const useOperators = () => {
  const { token, user } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<OperatorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    total: 0,
    pages: 1,
    limit: 10
  });

  const basePath = user?.role === 'MANAGER' ? '/managers' : '/admin';

  const fetchOperators = useCallback(async (params: FilterParams) => {
    try {
      setLoading(true);
      const endpoint = `${basePath}/operators`;

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());

      if (params.search) {
        queryParams.append('search', params.search);
      }

      // For admin, apply institution filter if selected
      if (user?.role === 'ADMIN' && params.institutionId) {
        queryParams.append('institutionId', params.institutionId);
      }

      const response = await api.get(`${endpoint}?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Map operators from the API response, converting isPending to isActive
      const mappedOperators = (response.data.operators || []).map((op: any) => ({
        id: op.id,
        name: op.name || 'Unnamed',
        email: op.email,
        // Convert isPending to isActive (isActive is the opposite of isPending)
        isActive: op.isActive !== undefined ? op.isActive : !op.isPending,
        institution: op.institution,
        postsCount: op.postsCount || 0,
        createdAt: op.createdAt,
        lastLoginDate: op.lastLoginDate
      }));

      setOperators(mappedOperators);

      if (response.data.pagination) {
        setPagination({
          page: response.data.pagination.page || 1,
          total: response.data.pagination.total || 0,
          pages: response.data.pagination.pages || 1,
          limit: response.data.pagination.limit || 10
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar operadores');
    } finally {
      setLoading(false);
    }
  }, [token, user?.role, basePath]);

  const fetchOperatorDetails = useCallback(async (operatorId: string) => {
    try {
      setLoading(true);
      const endpoint = `${basePath}/operators/${operatorId}`;

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const operator = response.data.operator;

      // Convert isPending to isActive for the operator details
      const mappedOperator = {
        ...operator,
        isActive: operator.isActive !== undefined ? operator.isActive : !operator.isPending
      };

      // Fetch all posts
      const postsResponse = await api.get(`${basePath}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter posts for the selected operator
      const operatorPosts = (postsResponse.data.posts || []).filter(
        (post: any) => post.author && post.author.id === operatorId
      );

      // Update the operator object with posts and correct count
      const updatedOperator = {
        ...mappedOperator,
        posts: operatorPosts,
        postsCount: operatorPosts.length
      };

      setSelectedOperator(updatedOperator);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar detalhes do operador');
    } finally {
      setLoading(false);
    }
  }, [token, basePath]);

  const updateOperator = useCallback(async (operatorId: string, data: any) => {
    try {
      setLoading(true);
      const endpoint = `${basePath}/operators/${operatorId}`;

      await api.put(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Operador atualizado com sucesso');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar operador');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, basePath]);

  const deleteOperator = useCallback(async (operatorId: string) => {
    try {
      setLoading(true);
      const endpoint = `${basePath}/operators/${operatorId}`;

      await api.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Operador excluído com sucesso');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir operador');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, basePath]);

  return {
    operators,
    selectedOperator,
    loading,
    pagination,
    fetchOperators,
    fetchOperatorDetails,
    updateOperator,
    deleteOperator,
    setSelectedOperator
  };
}; 