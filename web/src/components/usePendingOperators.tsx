import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

export const usePendingOperators = () => {
    const [pendingOperators, setPendingOperators] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { token, user } = useAuth();

    const basePath = user?.role === "MANAGER" ? "/manager" : "/admin";

    const fetchPendingOperators = async () => {
        if (!token) return;
        try {
            const response = await api.get(`${basePath}/pending-operators`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPendingOperators(response.data.operators);
        } catch (err) {
            setError("Erro ao carregar operadores pendentes.");
            toast.error("Erro ao carregar operadores pendentes.");
            console.error(err);
        }
    };

    const handleApproveOperator = async (operatorId: string) => {
        if (!token) return;
        try {
            await api.post(
                `${basePath}/approve-operator/${operatorId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPendingOperators();
            toast.success("Operador aprovado com sucesso!");
        } catch (err) {
            setError("Erro ao aprovar operador.");
            toast.error("Erro ao aprovar operador.");
            console.error(err);
        }
    };

    const handleRejectOperator = async (operatorId: string) => {
        if (!token) return;
        try {
            setPendingOperators(prevOperators =>
                prevOperators.filter(op => op.id !== operatorId)
            );

            toast.success("Operador rejeitado com sucesso!");

            await api.delete(`${basePath}/reject-operator/${operatorId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

        } catch (err: any) {
            if (err?.response?.status === 404) {
                return;
            }

            setError("Erro ao rejeitar operador.");
            toast.error("Erro ao rejeitar operador.");
            console.error(err);

            fetchPendingOperators();
        }
    };

    useEffect(() => {
        fetchPendingOperators();
    }, [token, user?.role]);

    return {
        pendingOperators,
        error,
        handleApproveOperator,
        handleRejectOperator,
        fetchPendingOperators,
    };
};