import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

interface Tag {
  name: string;
  weight: string | null;
}

interface TagSelectorProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: Tag[];
}

const TagSelector = ({ selectedTags, setSelectedTags, availableTags }: TagSelectorProps) => {
  const handleToggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const getRankingLabel = (totalWeight: number): string => {
    if (totalWeight <= 5) return "Baixo";
    if (totalWeight <= 10) return "Mediano";
    return "Urgente";
  };

  const totalWeight = selectedTags.reduce((sum, tagName) => {
    const tag = availableTags.find((t) => t.name === tagName);
    return sum + (tag && tag.weight ? parseFloat(tag.weight) : 0);
  }, 0);

  const rankingLabel = getRankingLabel(totalWeight);

  return (
    <View>
      <Text style={styles.sectionTitle}>Tags</Text>
      <View style={styles.tagContainer}>
        {availableTags.map((tag) => {
          let tagBackgroundColor = "#e0e0e0";
          if (tag.weight) {
            const weight = parseFloat(tag.weight);
            if (weight >= 10) tagBackgroundColor = "#ff4d4f";
            else if (weight >= 5) tagBackgroundColor = "#ffeb3b";
            else tagBackgroundColor = "#52c41a";
          }
          return (
            <Pressable
              key={tag.name}
              style={[
                styles.tagChip,
                { backgroundColor: tagBackgroundColor },
                selectedTags.includes(tag.name) && styles.tagChipSelected,
              ]}
              onPress={() => handleToggleTag(tag.name)}
            >
              <Text style={[styles.tagText, selectedTags.includes(tag.name) && styles.tagTextSelected]}>
                {tag.weight ? `${tag.name} (${tag.weight})` : tag.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.rankingDisplay}>
        Prioridade Atual: <Text style={styles.rankingValue}>Peso: {totalWeight} | Ranking: {rankingLabel}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 16, marginBottom: 8 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  tagChip: { borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  tagChipSelected: { backgroundColor: "#FF6633" },
  tagText: { color: "#333", fontSize: 14 },
  tagTextSelected: { color: "#fff" },
  rankingDisplay: { fontSize: 16, color: "#333", marginBottom: 12 },
  rankingValue: { fontWeight: "bold", color: "#092B6E" },
});

export default TagSelector;