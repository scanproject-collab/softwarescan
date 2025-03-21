import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, FlatList, Text, ActivityIndicator, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InteractionCard from '../components/cardInteraction';
import { validateToken } from '../utils/auth';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
      if (!response.ok) throw new Error(data.message || 'Erro ao buscar posts');

      const fetchedPosts = data.posts || [];
      setPosts(fetchedPosts);

      const tagsSet = new Set<string>();
      fetchedPosts.forEach((post: any) => {
        if (post.tags) post.tags.forEach((tag: string) => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet));
      setFilteredPosts(fetchedPosts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja apagar essa postagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!response.ok) throw new Error('Erro ao excluir postagem');

              setPosts(posts.filter((post: any) => post.id !== postId));
              setFilteredPosts(filteredPosts.filter((post: any) => post.id !== postId));
              Alert.alert('Sucesso', 'Postagem excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir a postagem.');
              console.error('Erro ao excluir:', error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = posts;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((post: any) =>
        (post.title?.toLowerCase().includes(query) || post.content?.toLowerCase().includes(query))
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post: any) =>
        post.tags && post.tags.some((tag: string) => selectedTags.includes(tag))
      );
    }
    setFilteredPosts(filtered);
  }, [searchQuery, selectedTags, posts]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag]);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchPosts();
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
      <View style={styles.headerContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por título ou conteúdo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable onPress={handleRefresh} style={styles.refreshIcon}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </Pressable>
      </View>

      {allTags.length > 0 && (
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
              title={item.title || 'Sem Título'}
              location={item.location || 'Local não especificado'}
              imageUrl={item.imageUrl}
              hasImage={!!item.imageUrl}
              tags={item.tags || []}
              onPress={() => router.push(`/pages/users/interaction/${item.id}`)}
              onDelete={() => handleDeletePost(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  refreshIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#666', textAlign: 'center', fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 80 },
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
  filterTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 16, marginBottom: 8 },
  tagList: { marginHorizontal: 16, marginBottom: 12 },
  tagChip: { backgroundColor: '#e0e0e0', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8 },
  tagChipSelected: { backgroundColor: '#007AFF' },
  tagText: { color: '#333', fontSize: 14 },
  tagTextSelected: { color: '#fff' },
});