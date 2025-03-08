import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, FlatList, Text, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InteractionCard from './components/cardInteraction';
import { validateToken } from './utils/auth';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]); // Posts filtrados
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Estado para a pesquisa
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Tags selecionadas para filtro
  const [allTags, setAllTags] = useState<string[]>([]); // Todas as tags disponíveis
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid) return;

        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/posts/my-posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (response.status === 401) {
          console.log('Token inválido ou expirado, redirecionando para login');
          await AsyncStorage.removeItem('userToken');
          router.replace('/pages/auth');
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao buscar posts');
        }

        console.log('Posts recebidos:', data);
        const fetchedPosts = data.posts || [];
        setPosts(fetchedPosts);

        // Extrair todas as tags únicas dos posts
        const tagsSet = new Set<string>();
        fetchedPosts.forEach((post: any) => {
          if (post.tags) {
            post.tags.forEach((tag: string) => tagsSet.add(tag));
          }
        });
        setAllTags(Array.from(tagsSet));

        // Inicialmente, os posts filtrados são todos os posts
        setFilteredPosts(fetchedPosts);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    // Filtrar os posts com base na pesquisa e nas tags selecionadas
    let filtered = posts;

    // Filtro por pesquisa (título ou conteúdo)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((post: any) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );
    }

    // Filtro por tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post: any) =>
          post.tags && post.tags.some((tag: string) => selectedTags.includes(tag))
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedTags, posts]);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
  }

  return (
      <View style={styles.container}>
        {/* Barra de Pesquisa */}
        <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por título ou conteúdo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
        />

        {/* Filtro de Tags */}
        {allTags.length > 0 && (
            <View>
              <Text style={styles.filterTitle}>Filtrar por Tags:</Text>
              <FlatList
                  data={allTags}
                  horizontal
                  renderItem={({ item }) => (
                      <Pressable
                          style={[
                            styles.tagChip,
                            selectedTags.includes(item) && styles.tagChipSelected,
                          ]}
                          onPress={() => handleToggleTag(item)}
                      >
                        <Text
                            style={[
                              styles.tagText,
                              selectedTags.includes(item) && styles.tagTextSelected,
                            ]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                  )}
                  keyExtractor={(item) => item}
                  style={styles.tagList}
              />
            </View>
        )}

        {filteredPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedTags.length > 0
                    ? 'Nenhum post encontrado com os filtros aplicados.'
                    : 'Você ainda não possui nenhuma postagem. Crie uma nova interação!'}
              </Text>
            </View>
        ) : (
            <FlatList
                data={filteredPosts}
                renderItem={({ item }) => (
                    <InteractionCard
                        location={item.location || 'Local não especificado'}
                        imageUrl={item.imageUrl}
                        hasImage={!!item.imageUrl}
                        tags={item.tags || []}
                        onPress={() => router.push(`/pages/users/interaction/${item.id}`)}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        )}

        <Pressable
            style={styles.addButton}
            onPress={() => router.push('/pages/users/interaction/newInteraction')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    marginBottom: 8,
  },
  tagList: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tagChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  tagChipSelected: {
    backgroundColor: '#007AFF',
  },
  tagText: {
    color: '#333',
    fontSize: 14,
  },
  tagTextSelected: {
    color: '#fff',
  },
});