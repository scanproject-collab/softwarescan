import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '@/src/app/utils/ValidateAuth';
import NetInfo from "@react-native-community/netinfo";
import PostList from '../components/home/PostList';
import SearchBar from '../components/home/SearchBar';
import TagFilter from '../components/home/TagFilter';
import OfflineMessage from '../components/home/OfflineMessage';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [offlinePosts, setOfflinePosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  const syncingRef = useRef(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

  const clearOldCachePosts = async () => {
    try {
      const cachedPostsStr = await AsyncStorage.getItem('cachedPosts');
      const cachedPosts = cachedPostsStr ? JSON.parse(cachedPostsStr) : [];
      
      const updatedPosts = cachedPosts.filter((post: any) => post.offlineId);
      
      if (cachedPosts.length !== updatedPosts.length) {
        await AsyncStorage.setItem('cachedPosts', JSON.stringify(updatedPosts));
        console.log("Posts antigos removidos do cache.");
      }
    } catch (error) {
      console.error("Erro ao limpar posts antigos:", error);
    }
  };

  const sendOfflinePosts = async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const netInfo = await NetInfo.fetch();
      const isActuallyConnected = await checkActualConnectivity();
      if (!netInfo.isConnected || !isActuallyConnected) {
        setIsOffline(true);
        return;
      }

      const offlinePostsStr = await AsyncStorage.getItem('offlinePosts');
      if (!offlinePostsStr) return;

      let offlinePostsArray = JSON.parse(offlinePostsStr);
      if (offlinePostsArray.length === 0) return;

      const token = await AsyncStorage.getItem('userToken');
      for (let i = offlinePostsArray.length - 1; i >= 0; i--) {
        const post = offlinePostsArray[i];
        if (post.syncFailed) continue;

        const formData = new FormData();
        formData.append('title', post.title || 'Interação sem título');
        formData.append('content', post.description || '');
        formData.append('tags', post.tags.join(','));
        formData.append('location', post.location);
        formData.append('latitude', post.latitude?.toString() || '');
        formData.append('longitude', post.longitude?.toString() || '');
        formData.append('weight', post.weight);
        formData.append('ranking', post.ranking);
        formData.append('offlineId', post.offlineId || post.id || '');

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
            offlinePostsArray.splice(i, 1);
            await AsyncStorage.setItem('offlinePosts', JSON.stringify(offlinePostsArray));
            setOfflinePosts([...offlinePostsArray]);
          } else {
            offlinePostsArray[i].syncFailed = true;
            await AsyncStorage.setItem('offlinePosts', JSON.stringify(offlinePostsArray));
          }
        } catch (error) {
          offlinePostsArray[i].syncFailed = true;
          await AsyncStorage.setItem('offlinePosts', JSON.stringify(offlinePostsArray));
        }
      }

      await fetchPosts();
    } finally {
      syncingRef.current = false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await clearOldCachePosts();
      await fetchPosts();
      await loadOfflinePosts();

      const unsubscribe = NetInfo.addEventListener(async state => {
        const isConnected = state.isConnected && (await checkActualConnectivity());
        setIsOffline(!isConnected);
        if (isConnected) {
          sendOfflinePosts();
        }
      });

      return () => unsubscribe();
    };
    initialize();
  }, []);

  useEffect(() => {
    let combinedPosts = isOffline
      ? [...posts, ...offlinePosts.map(post => ({ ...post, isOffline: true }))]
      : [...posts];

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
  }, [posts, offlinePosts, searchQuery, selectedTags, isOffline]);

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
      <OfflineMessage isOffline={isOffline} />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleRefresh={handleRefresh} />
      {allTags.length > 0 && (
        <TagFilter allTags={allTags} selectedTags={selectedTags} handleToggleTag={handleToggleTag} />
      )}
      <PostList filteredPosts={filteredPosts} handleDeletePost={handleDeletePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
});
