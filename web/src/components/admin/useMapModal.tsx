import { useState } from "react";

export const useMapModal = () => {
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedInteraction, setSelectedInteraction] = useState<any | null>(null);

    const openMapModal = (interaction: any) => {
        setSelectedInteraction(interaction);
        setIsMapModalOpen(true);
    };

    const closeMapModal = () => {
        setIsMapModalOpen(false);
        setSelectedInteraction(null);
    };

    return {
        isMapModalOpen,
        selectedInteraction,
        openMapModal,
        closeMapModal,
    };
};