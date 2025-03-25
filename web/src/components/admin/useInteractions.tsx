import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export const useInteractions = () => {
    const [interactions, setInteractions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { token, user } = useAuth();

    const basePath = user?.role === "MANAGER" ? "/manager" : "/admin";

    const fetchInteractions = async () => {
        if (!token) return;
        try {

            const response = await api.get(`${basePath}/listAllPosts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setInteractions(response.data.posts || []);
        } catch (err) {
            setError("Erro ao carregar interações.");
            toast.error("Erro ao carregar interações.");
            console.error(err);
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
        const interval = setInterval(() => {
            fetchInteractions();
        }, 10000);
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