import { useState, useMemo, useEffect } from "react";
import api from "../../../shared/services/api";
import { useAuth } from "../../../hooks/useAuth";

// Define the Interaction type here
interface Interaction {
  id: string;
  title: string;
  status?: string;
  createdAt: string | Date;
  tags?: Array<string | { id: string; name: string }>;
  [key: string]: any;
}

export const useInteractionFilters = (interactions: Interaction[]) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
    let filtered = interactions.filter((interaction) => {
      const matchesAuthor =
        interaction.author.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

      // Fix the tag check to handle both string and object tags
      const matchesTags =
        selectedTags.length === 0 || (Array.isArray(interaction.tags) && interaction.tags.some(tag => {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          return selectedTags.includes(tagName);
        }));

      const matchesRanking = !selectedRanking || interaction.ranking === selectedRanking;
      const matchesInstitution =
        !selectedInstitution || interaction.author.institution?.id === selectedInstitution;
      const matchesUser = !selectedUser || interaction.author.id === selectedUser;
      return matchesAuthor && matchesTags && matchesRanking && matchesInstitution && matchesUser;
    });

    const rankingOrder: Record<string, number> = {
      Urgente: 1,
      Mediano: 2,
      Baixo: 3,
    };

    filtered.sort((a, b) => {
      const aRanking = rankingOrder[a.ranking || ""] || 4;
      const bRanking = rankingOrder[b.ranking || ""] || 4;
      if (aRanking !== bRanking) return aRanking - bRanking;
      const aWeight = parseFloat(String(a.weight)) || 0;
      const bWeight = parseFloat(String(b.weight)) || 0;
      return bWeight - aWeight;
    });

    return filtered;
  }, [interactions, searchTerm, selectedTags, selectedRanking, selectedInstitution, selectedUser]);

  const uniqueTags = useMemo(() => {
    // Extract tag names from both string and object tags
    const allTagsRaw = interactions.flatMap(interaction =>
      (interaction.tags || []).map(tag => typeof tag === 'string' ? tag : tag.name)
    );

    // Add 'Todas as tags' and deduplicate
    const allTags = ["Todas as tags", ...new Set(allTagsRaw)];
    return allTags as string[];
  }, [interactions]);

  const uniqueRankings = useMemo(() => {
    return [...new Set(interactions.map((interaction) => interaction.ranking || ""))];
  }, [interactions]);

  const toggleTagSelection = (tag: string) => {
    if (tag === "Todas as tags") {
      setSelectedTags(uniqueTags.filter(t => t !== "Todas as tags"));
    } else {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    }
  };

  const selectedTagsPlaceholder = selectedTags.length > 0
    ? selectedTags.slice(0, 2).join(", ") + (selectedTags.length > 2 ? ", ..." : "")
    : "Selecione tags";

  return {
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    selectedTagsPlaceholder,
    toggleTagSelection,
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