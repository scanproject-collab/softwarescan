import { useState } from "react";
import { Interaction } from '../../interactions/types/interactions';

export const useMapModal = () => {
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);

    const openMapModal = (interaction: Interaction) => {
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