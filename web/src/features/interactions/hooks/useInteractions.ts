import { useState, useEffect } from "react";
import api from "../../../shared/services/api";
import { useAuth } from "../../../hooks/useAuth";
import { handleApiError } from "../../../shared/utils/errorHandler";

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
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  const basePath = user?.role === "MANAGER" ? "/managers" : "/admin";

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
    setLoading(true);
    fetchInteractions();
  };

  useEffect(() => {
    fetchInteractions();

    // Automatic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchInteractions();
    }, 30000);

    return () => clearInterval(interval);
  }, [token, user?.role]);

  return {
    interactions,
    loading,
    error,
    fetchInteractions,
    handleRefresh,
    setInteractions,
    setLoading,
  };
};