import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  handleToggleTag: (tag: string) => void;
}

const TagFilter = ({ allTags, selectedTags, handleToggleTag }: TagFilterProps) => {
  return (
    <View>
      <Text style={styles.filterTitle}>Filtrar por Tags:</Text>
      <FlatList
        data={allTags}
        horizontal
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tagChip, selectedTags.includes(item) && styles.tagChipSelected]}
            onPress={() => handleToggleTag(item)}
          >
            <Text style={[styles.tagText, selectedTags.includes(item) && styles.tagTextSelected]}>
              {item}
            </Text>
          </Pressable>
        )}
        keyExtractor={(item) => item}
        style={styles.tagList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 16, marginBottom: 8 },
  tagList: { marginHorizontal: 16, marginBottom: 12 },
  tagChip: { backgroundColor: '#e0e0e0', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8 },
  tagChipSelected: { backgroundColor: '#007AFF' },
  tagText: { color: '#333', fontSize: 14 },
  tagTextSelected: { color: '#fff' },
});

export default TagFilter;