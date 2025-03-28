import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, FlatList, Text, ActivityIndicator, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InteractionCard from '../components/cardInteraction';
import { validateToken } from '../utils/validateAuth';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from "@react-native-community/netinfo";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [offlinePosts, setOfflinePosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [syncing, setSyncing] = useState(false); // Flag to prevent concurrent syncs
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Function to check actual connectivity
  const checkActualConnectivity = async () => {
    try {
      const response = await fetch(`${API_URL}/ping`, { method: 'GET', timeout: 5000 });
      return response.ok;
    } catch {
      return false;
    }
  };

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
        await AsyncStorage.removeItem('userToken');
        router.replace('/pages/auth');
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao buscar posts');

      const fetchedPosts = data.posts || [];
      setPosts(fetchedPosts);
      await AsyncStorage.setItem('cachedPosts', JSON.stringify(fetchedPosts));

      const tagsSet = new Set<string>();
      fetchedPosts.forEach((post: any) => {
        if (post.tags) post.tags.forEach((tag: string) => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet));
      setIsOffline(false);
    } catch (error) {
      const cachedPosts = await AsyncStorage.getItem('cachedPosts');
      if (cachedPosts) {
        const parsedPosts = JSON.parse(cachedPosts);
        setPosts(parsedPosts);
        const tagsSet = new Set<string>();
        parsedPosts.forEach((post: any) => {
          if (post.tags) post.tags.forEach((tag: string) => tagsSet.add(tag));
        });
        setAllTags(Array.from(tagsSet));
      }
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const loadOfflinePosts = async () => {
    const offlinePostsStr = await AsyncStorage.getItem('offlinePosts');
    const offlinePosts = offlinePostsStr ? JSON.parse(offlinePostsStr) : [];
    setOfflinePosts(offlinePosts);
  };

  const sendOfflinePosts = async () => {
    if (syncing) return; // Prevent concurrent syncs
    setSyncing(true);

    const netInfo = await NetInfo.fetch();
    const isActuallyConnected = await checkActualConnectivity();
    if (!netInfo.isConnected || !isActuallyConnected) {
      setIsOffline(true);
      setSyncing(false);
      return;
    }

    const offlinePostsStr = await AsyncStorage.getItem('offlinePosts');
    if (!offlinePostsStr) {
      setSyncing(false);
      return;
    }

    let offlinePosts = JSON.parse(offlinePostsStr);
    if (offlinePosts.length === 0) {
      setSyncing(false);
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    for (let i = offlinePosts.length - 1; i >= 0; i--) {
      const post = offlinePosts[i];
      if (post.syncFailed) continue; // Skip posts that already failed

      const formData = new FormData();
      formData.append('title', post.title || 'Interação sem título');
      formData.append('content', post.description || '');
      formData.append('tags', post.tags.join(','));
      formData.append('location', post.location);
      formData.append('latitude', post.latitude?.toString() || '');
      formData.append('longitude', post.longitude?.toString() || '');
      formData.append('weight', post.weight);
      formData.append('ranking', post.ranking);

      if (post.image) {
        const fileName = post.image.split('/').pop();
        formData.append('image', {
          uri: post.image,
          type: 'image/jpeg',
          name: fileName || 'image.jpg',
        } as any);
      }

      try {
        const response = await fetch(`${API_URL}/posts/create`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          offlinePosts.splice(i, 1);
          await AsyncStorage.setItem('offlinePosts', JSON.stringify(offlinePosts));
          setOfflinePosts([...offlinePosts]);
          await fetchPosts(); // Update online posts
        } else {
          offlinePosts[i].syncFailed = true; // Mark as failed
          await AsyncStorage.setItem('offlinePosts', JSON.stringify(offlinePosts));
        }
      } catch (error) {
        console.error('Erro ao sincronizar post:', post.id, error);
        offlinePosts[i].syncFailed = true; // Mark as failed
        await AsyncStorage.setItem('offlinePosts', JSON.stringify(offlinePosts));
      }
    }
    setSyncing(false);
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchPosts();
      await loadOfflinePosts();
      const unsubscribe = NetInfo.addEventListener(async state => {
        const isConnected = state.isConnected && (await checkActualConnectivity());
        console.log('Connection status:', isConnected ? 'online' : 'offline');
        setIsOffline(!isConnected);
        if (isConnected) sendOfflinePosts();
      });
      return () => unsubscribe();
    };
    initialize();
  }, []);

  useEffect(() => {
    const combinedPosts = [...posts, ...offlinePosts.map(post => ({ ...post, isOffline: true }))];
    let filtered = combinedPosts;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        (post.title?.toLowerCase().includes(query) || post.description?.toLowerCase().includes(query))
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter(post =>
        post.tags && post.tags.some((tag: string) => selectedTags.includes(tag))
      );
    }
    setFilteredPosts(filtered);
  }, [posts, offlinePosts, searchQuery, selectedTags]);

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

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchPosts();
    await loadOfflinePosts();
    await sendOfflinePosts();
    setLoading(false);
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
      {isOffline && (
        <View style={styles.offlineMessage}>
          <Text style={styles.offlineText}>Você está offline</Text>
        </View>
      )}
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

      <FlatList
        data={filteredPosts}
        renderItem={({ item }) => (
          <InteractionCard
            title={item.title || 'Sem Título'}
            location={item.location || 'Local não especificado'}
            imageUrl={item.image || item.imageUrl}
            hasImage={!!(item.image || item.imageUrl)}
            tags={item.tags || []}
            onPress={() => {
              if (item.isOffline) {
                Alert.alert('Post Offline', 'Este post será sincronizado quando houver conexão.');
              } else {
                router.push(`/pages/users/interaction/${item.id}`);
              }
            }}
            onDelete={item.isOffline ? undefined : () => handleDeletePost(item.id)}
            isOffline={item.isOffline}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedTags.length > 0
                ? 'Nenhum post encontrado.'
                : 'Nenhuma interação disponível. Crie uma nova!'}
            </Text>
          </View>
        }
      />
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
    backgroundColor: '#092B6E',
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
  offlineMessage: { backgroundColor: '#ffeb3b', padding: 10, alignItems: 'center' },
  offlineText: { color: '#333', fontWeight: 'bold' },
});