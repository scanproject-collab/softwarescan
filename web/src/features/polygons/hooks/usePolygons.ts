import { useState, useEffect } from 'react';
import api from '../../../shared/services/api';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Polygon } from '../types/polygon.types';

export const usePolygons = () => {
    const { token, user } = useAuth();
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPolygons = async () => {
        try {
            setLoading(true);
            const response = await api.get('/polygons', {
                headers: { Authorization: `Bearer ${token}` },
                params: { role: user?.role, institutionId: user?.institutionId }
            });
            setPolygons(response.data.polygons);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao carregar polígonos:', errorMessage);
            toast.error('Erro ao carregar polígonos.');
        } finally {
            setLoading(false);
        }
    };

    const deletePolygon = async (polygonId: string) => {
        if (window.confirm('Deseja excluir este polígono?')) {
            try {
                await api.delete(`/polygons/${polygonId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPolygons(polygons.filter((p) => p.id !== polygonId));
                toast.success('Polígono excluído com sucesso!');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                console.error('Erro ao excluir polígono:', errorMessage);
                toast.error('Erro ao excluir polígono.');
            }
        }
    };

    const createPolygon = async (name: string, points: any[], notes?: string) => {
        try {
            const response = await api.post(
                '/polygons/create',
                { name, points, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchPolygons(); // Recarregar a lista após criar
            toast.success('Polígono salvo com sucesso!');
            return response.data;
        } catch (error) {
            console.error('Erro ao salvar polígono:', error);
            toast.error('Erro ao salvar polígono.');
            throw error;
        }
    };

    useEffect(() => {
        if (token) {
            fetchPolygons();
        }
    }, [token, user?.role, user?.institutionId]);

    return {
        polygons,
        loading,
        fetchPolygons,
        deletePolygon,
        createPolygon
    };
}; 