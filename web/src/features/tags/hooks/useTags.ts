import { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/services/api';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Tag, TagResponse, TagFormData } from '../types/tag.types';

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();

  const fetchTags = useCallback(async () => {
    if (!token) return;

    try {
      console.log('Fetching tags...');
      setLoading(true);
      const response = await api.get<TagResponse>('/tags', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Tags API response:', response.data);
      const tagList = response.data.tags || [];
      setTags(tagList);
      console.log('Tags set in state:', tagList);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
      if (error.response) {
        console.error('Response error details:', error.response.status, error.response.data);
      }
      toast.error('Erro ao carregar tags.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createTag = useCallback(async (tagData: TagFormData) => {
    if (!token) return false;

    try {
      const capitalizedTagName = tagData.name.charAt(0).toUpperCase() + tagData.name.slice(1);

      await api.post(
        '/tags',
        { name: capitalizedTagName, weight: tagData.weight },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Tag criada com sucesso!');
      fetchTags();
      return true;
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      if (error.response) {
        console.error('Erro detalhado:', error.response.data);
      }
      toast.error('Erro ao criar tag.');
      return false;
    }
  }, [token, fetchTags]);

  const updateTag = useCallback(async (originalName: string, tagData: TagFormData) => {
    if (!token) return false;

    try {
      const capitalizedTagName = tagData.name.charAt(0).toUpperCase() + tagData.name.slice(1);

      await api.put(
        `/tags/${encodeURIComponent(originalName)}`,
        { newName: capitalizedTagName, weight: tagData.weight || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Tag atualizada com sucesso!');
      fetchTags();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tag:', error);
      toast.error('Erro ao atualizar tag.');
      return false;
    }
  }, [token, fetchTags]);

  const deleteTag = useCallback(async (name: string) => {
    if (!token) return false;

    try {
      await api.delete(`/tags/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Tag excluída com sucesso!');
      fetchTags();
      return true;
    } catch (error) {
      console.error('Erro ao excluir tag:', error);
      toast.error('Erro ao excluir tag.');
      return false;
    }
  }, [token, fetchTags]);

  useEffect(() => {
    if (token) {
      fetchTags();
    }
  }, [token, fetchTags]);

  return {
    tags,
    loading,
    fetchTags,
    createTag,
    updateTag,
    deleteTag
  };
}; 