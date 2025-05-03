import { useState, useCallback } from 'react';
import api from '../../../shared/services/api';
import { useToast } from '../../../shared/hooks/useToast';
import { Institution, CreateInstitutionDto, UpdateInstitutionDto } from '../types/institutions';

/**
 * Hook para gerenciamento de instituições
 */
export const useInstitutions = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt'>('title');
  const toast = useToast();

  /**
   * Busca instituições
   */
  const fetchInstitutions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/institutions');
      const institutionList = response.data.institutions || [];
      setInstitutions(institutionList);
      return institutionList;
    } catch (err: any) {
      toast.error('Erro ao carregar instituições.');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Cria uma nova instituição
   */
  const createInstitution = useCallback(async (data: CreateInstitutionDto) => {
    try {
      const response = await api.post('/institutions', data);
      toast.success('Instituição criada com sucesso!');
      await fetchInstitutions();
      return response.data;
    } catch (err: any) {
      toast.error('Erro ao criar instituição.');
      console.error(err);
      return null;
    }
  }, [fetchInstitutions, toast]);

  /**
   * Atualiza uma instituição
   */
  const updateInstitution = useCallback(async (id: string, data: UpdateInstitutionDto) => {
    try {
      const response = await api.put(`/institutions/${id}`, data);
      toast.success('Instituição atualizada com sucesso!');
      await fetchInstitutions();
      return response.data;
    } catch (err: any) {
      toast.error('Erro ao atualizar instituição.');
      console.error(err);
      return null;
    }
  }, [fetchInstitutions, toast]);

  /**
   * Deleta uma instituição
   */
  const deleteInstitution = useCallback(async (id: string) => {
    try {
      await api.delete(`/institutions/${id}`);
      toast.success('Instituição excluída com sucesso!');
      await fetchInstitutions();
      return true;
    } catch (err: any) {
      toast.error('Erro ao excluir instituição.');
      console.error(err);
      return false;
    }
  }, [fetchInstitutions, toast]);

  /**
   * Filtra instituições pelo termo de busca
   */
  const getFilteredInstitutions = useCallback(() => {
    return institutions.filter(inst =>
      inst.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [institutions, searchTerm]);

  /**
   * Ordena instituições pelo critério selecionado
   */
  const getSortedInstitutions = useCallback(() => {
    const filtered = getFilteredInstitutions();
    return [...filtered].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });
  }, [getFilteredInstitutions, sortBy]);

  return {
    institutions,
    loading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    fetchInstitutions,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    getFilteredInstitutions,
    getSortedInstitutions,
  };
}; 