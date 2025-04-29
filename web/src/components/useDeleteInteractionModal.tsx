import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

export const useDeleteInteractionModal = (setInteractions: (interactions: any[]) => void, interactions: any[]) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const { token } = useAuth(); 

    const openDeleteModal = (postId: string) => {
        setPostToDelete(postId);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setPostToDelete(null);
    };

    const handleDeleteInteraction = async () => {
        if (!token || !postToDelete) return;
        try {
            await api.delete(`/posts/${postToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setInteractions(interactions.filter((interaction) => interaction.id !== postToDelete));
            toast.success("Interação excluída com sucesso!");
            closeDeleteModal();
        } catch (err) {
            toast.error("Erro ao excluir interação.");
            console.error(err);
        }
    };

    return {
        isModalOpen,
        openDeleteModal,
        closeDeleteModal,
        handleDeleteInteraction,
        postToDelete,
    };
};