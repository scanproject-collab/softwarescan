import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleRefresh: () => void;
}

const SearchBar = ({ searchQuery, setSearchQuery, handleRefresh }: SearchBarProps) => {
  return (
    <View style={styles.headerContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar por título ou descrição..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Pressable onPress={handleRefresh} style={styles.refreshIcon}>
        <Ionicons name="refresh" size={24} color="#fff" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  refreshIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#092B6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default SearchBar;