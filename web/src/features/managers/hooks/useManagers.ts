import { useState, useCallback } from 'react';
import api from '../../../shared/services/api';
import { Manager, CreateManagerDto, UpdateManagerInstitutionDto } from '../types/managers';
import { Institution } from '../../institutions/types/institutions';
import { handleApiError, showSuccess } from '../../../shared/utils/errorHandler';

/**
 * Hook para gerenciamento de gerentes
 */
export const useManagers = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Busca gerentes e instituições
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar instituições
      const institutionsResponse = await api.get('/institutions');
      setInstitutions(institutionsResponse.data.institutions || []);

      // Buscar gerentes
      const managersResponse = await api.get('/admin/managers');
      setManagers(managersResponse.data.managers || []);

      return {
        managers: managersResponse.data.managers,
        institutions: institutionsResponse.data.institutions
      };
    } catch (err: any) {
      handleApiError(err, 'Erro ao carregar dados de gerentes e instituições');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria um novo gerente
   */
  const createManager = useCallback(async (data: CreateManagerDto) => {
    try {
      setIsCreating(true);

      // Gerar código de verificação para o usuário
      const verificationCodeResponse = await api.post('/auth/generate-verification-code', {
        email: data.email
      });

      if (verificationCodeResponse.data.verificationCode) {
        // Criar gerente com o código de verificação
        const createResponse = await api.post('/admin/managers', {
          ...data,
          verificationCode: verificationCodeResponse.data.verificationCode
        });

        // Adicionar o novo gerente à lista
        setManagers((prevManagers) => [
          ...prevManagers,
          createResponse.data.manager
        ]);

        showSuccess('Gerente criado com sucesso!');
        return createResponse.data.manager;
      } else {
        throw new Error('Não foi possível gerar o código de verificação');
      }
    } catch (err: any) {
      handleApiError(err, 'Erro ao criar gerente');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Atualiza a instituição de um gerente
   */
  const updateManagerInstitution = useCallback(async (managerId: string, data: UpdateManagerInstitutionDto) => {
    try {
      await api.put(`/admin/managers/${managerId}/institution`, data);

      // Atualizar a lista de gerentes
      setManagers(prevManagers =>
        prevManagers.map(manager =>
          manager.id === managerId
            ? {
              ...manager,
              institution: institutions.find(inst => inst.id === data.institutionId)
                ? {
                  id: data.institutionId as string,
                  title: institutions.find(inst => inst.id === data.institutionId)!.title
                }
                : null
            }
            : manager
        )
      );

      showSuccess('Instituição do gerente atualizada com sucesso!');
      return true;
    } catch (err: any) {
      handleApiError(err, 'Erro ao atualizar instituição do gerente');
      return false;
    }
  }, [institutions]);

  /**
   * Deleta um gerente
   */
  const deleteManager = useCallback(async (managerId: string) => {
    try {
      await api.delete(`/admin/managers/${managerId}`);

      // Remover o gerente da lista
      setManagers(prevManagers =>
        prevManagers.filter(manager => manager.id !== managerId)
      );

      showSuccess('Gerente excluído com sucesso!');
      return true;
    } catch (err: any) {
      handleApiError(err, 'Erro ao excluir gerente');
      return false;
    }
  }, []);

  return {
    managers,
    institutions,
    loading,
    isCreating,
    fetchData,
    createManager,
    updateManagerInstitution,
    deleteManager
  };
}; 