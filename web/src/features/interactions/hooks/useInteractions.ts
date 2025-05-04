import { useState, useEffect, useCallback } from "react";
import api from "../../../shared/services/api";
import { useAuth } from "../../../hooks/useAuth";
import { handleApiError } from "../../../shared/utils/errorHandler";
import toast from "react-hot-toast";

interface Interaction {
  id: string;
  weight?: string | number;
  title?: string;
  imageUrl?: string;
  createdAt?: string | Date;
  content?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  ranking?: string;
  author: {
    id: string;
    name?: string;
    email?: string;
    institution?: {
      id: string;
      title?: string;
    };
  };
}

export const useInteractions = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  const fetchInteractions = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await api.get(user?.role === "MANAGER" ? "/managers/posts" : "/admin/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInteractions(response.data.posts || []);
      setError(null);
    } catch (err) {
      const errorMessage = handleApiError(err, "Erro ao carregar interações.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);

    api.get(user?.role === "MANAGER" ? "/managers/posts" : "/admin/posts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setInteractions(response.data.posts || []);
        setError(null);
      })
      .catch(err => {
        const errorMessage = handleApiError(err, "Erro ao atualizar interações.");
        setError(errorMessage);
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchInteractions();

    // Automatic refresh every 30 seconds
    const interval = setInterval(() => {
      // Usar o modo refreshing para atualizações automáticas também
      setRefreshing(true);

      api.get(user?.role === "MANAGER" ? "/managers/posts" : "/admin/posts", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setInteractions(response.data.posts || []);
          setError(null);
        })
        .catch(err => {
          console.error("Erro ao atualizar interações:", err);
          // Não exibir erros para atualizações automáticas de fundo
        })
        .finally(() => {
          setRefreshing(false);
        });
    }, 30000);

    return () => clearInterval(interval);
  }, [token, user?.role]);

  return {
    interactions,
    loading,
    refreshing,
    error,
    fetchInteractions,
    handleRefresh,
    setInteractions,
    setLoading,
    setRefreshing,
  };
};