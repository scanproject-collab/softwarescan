import { useState, useMemo } from "react";

export const useInteractionFilters = (interactions: any[]) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedRanking, setSelectedRanking] = useState<string | null>(null);

    const filteredInteractions = useMemo(() => {
        return interactions.filter((interaction) => {
            const matchesAuthor = interaction.author.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) || false;
            const matchesTag =
                !selectedTag || (interaction.tags && interaction.tags.includes(selectedTag));
            const matchesRanking =
                !selectedRanking || interaction.ranking === selectedRanking;
            return matchesAuthor && matchesTag && matchesRanking;
        });
    }, [interactions, searchTerm, selectedTag, selectedRanking]);

    const uniqueTags = useMemo(() => {
        return [
            ...new Set(interactions.flatMap((interaction) => interaction.tags || [])),
        ];
    }, [interactions]);

    const uniqueRankings = useMemo(() => {
        return [...new Set(interactions.map((interaction) => interaction.ranking))];
    }, [interactions]);

    return {
        searchTerm,
        setSearchTerm,
        selectedTag,
        setSelectedTag,
        selectedRanking,
        setSelectedRanking,
        filteredInteractions,
        uniqueTags,
        uniqueRankings,
    };
};