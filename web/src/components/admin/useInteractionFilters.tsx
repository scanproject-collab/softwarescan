import { useState, useMemo, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export const useInteractionFilters = (interactions: any[]) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedRanking, setSelectedRanking] = useState<string | null>(null);
    const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
    const [uniqueInstitutions, setUniqueInstitutions] = useState<any[]>([]);
    const { token } = useAuth();

    const fetchInstitutions = async () => {
        if (!token) return;
        try {
            const response = await api.get("/institutions", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Instituições retornadas pela API:", response.data.institutions);
            if (response.data && response.data.institutions) {
                const mappedInstitutions = response.data.institutions.map((inst: any) => ({
                    id: inst.id,
                    title: inst.title,
                }));
                setUniqueInstitutions(mappedInstitutions);
            } else {
                setUniqueInstitutions([]);
            }
        } catch (error) {
            console.error("Erro ao carregar instituições:", error);
            setUniqueInstitutions([]);
        }
    };

    useEffect(() => {
        fetchInstitutions();
    }, [token]);

    const filteredInteractions = useMemo(() => {
        console.log("Filtrando interações...");
        console.log("selectedInstitution:", selectedInstitution);
        console.log("Interações recebidas:", interactions);

        return interactions.filter((interaction) => {
            const matchesAuthor =
                interaction.author.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const matchesTag =
                !selectedTag || (interaction.tags && interaction.tags.includes(selectedTag));
            const matchesRanking = !selectedRanking || interaction.ranking === selectedRanking;

            const institutionId = interaction.author.institution?.id;
            console.log(
                `Interação ID: ${interaction.id}, Autor: ${interaction.author.name}, Instituição ID: ${institutionId}, Completa:`,
                interaction.author.institution
            );
            console.log(
                `Comparando institution.id (${institutionId}) com selectedInstitution (${selectedInstitution})`
            );

            const matchesInstitution =
                !selectedInstitution || (institutionId && institutionId === selectedInstitution);

            return matchesAuthor && matchesTag && matchesRanking && matchesInstitution;
        });
    }, [interactions, searchTerm, selectedTag, selectedRanking, selectedInstitution]);

    const uniqueTags = useMemo(() => {
        return [...new Set(interactions.flatMap((interaction) => interaction.tags || []))];
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
        selectedInstitution,
        setSelectedInstitution,
        filteredInteractions,
        uniqueTags,
        uniqueRankings,
        uniqueInstitutions,
    };
};