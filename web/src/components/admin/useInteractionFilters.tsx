import { useState, useMemo, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export const useInteractionFilters = (interactions: any[]) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedRanking, setSelectedRanking] = useState<string | null>(null);
    const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [usersInInstitution, setUsersInInstitution] = useState<any[]>([]);
    const [uniqueInstitutions, setUniqueInstitutions] = useState<any[]>([]);
    const { token, user } = useAuth();

    const fetchInstitutions = async () => {
        if (!token || user?.role !== "ADMIN") return;
        try {
            const response = await api.get("/institutions", {
                headers: { Authorization: `Bearer ${token}` },
            });
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
    }, [token, user?.role]);

    useEffect(() => {
        if (selectedInstitution) {
            const users = interactions
                .filter((interaction) => interaction.author.institution?.id === selectedInstitution)
                .map((interaction) => interaction.author)
                .filter((user, index, self) => self.findIndex((u) => u.id === user.id) === index);
            setUsersInInstitution(users);
        } else {
            setUsersInInstitution([]);
        }
        setSelectedUser(null);
    }, [selectedInstitution, interactions]);

    const filteredInteractions = useMemo(() => {
        return interactions.filter((interaction) => {
            const matchesAuthor =
                interaction.author.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const matchesTag =
                !selectedTag || (interaction.tags && interaction.tags.includes(selectedTag));
            const matchesRanking = !selectedRanking || interaction.ranking === selectedRanking;
            const matchesInstitution =
                !selectedInstitution || interaction.author.institution?.id === selectedInstitution;
            const matchesUser = !selectedUser || interaction.author.id === selectedUser;
            return matchesAuthor && matchesTag && matchesRanking && matchesInstitution && matchesUser;
        });
    }, [interactions, searchTerm, selectedTag, selectedRanking, selectedInstitution, selectedUser]);

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
        selectedUser,
        setSelectedUser,
        usersInInstitution,
        filteredInteractions,
        uniqueTags,
        uniqueRankings,
        uniqueInstitutions,
    };
};