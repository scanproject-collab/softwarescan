import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '@/src/app/utils/ValidateAuth';
import NetInfo from "@react-native-community/netinfo";
import PostList from '../components/home/PostList';
import SearchBar from '../components/home/SearchBar';
import TagFilter from '../components/home/TagFilter';
import OfflineMessage from '../components/home/OfflineMessage';

// Define constant for storage keys
const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  CACHED_POSTS: 'cachedPosts',
  OFFLINE_POSTS: 'offlinePosts',
  LAST_FETCH: 'lastPostsFetch'
};

// Debounce function to prevent excessive rerenders
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [offlinePosts, setOfflinePosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const syncingRef = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const checkActualConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_URL}/ping`, {
        method: 'GET',
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);
      return response && response.ok;
    } catch {
      return false;
    }
  }, [API_URL]);

  const fetchPosts = useCallback(async (forceRefresh = false) => {
    try {
      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      const isValid = await validateToken();
      if (!isValid) {
        setLoading(false);
        return;
      }

      // Check if we have recent cache (less than 5 minutes old) and not forcing refresh
      if (!forceRefresh) {
        const lastFetchStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_FETCH);
        const cachedPostsStr = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_POSTS);

        if (lastFetchStr && cachedPostsStr) {
          const lastFetch = parseInt(lastFetchStr);
          const currentTime = Date.now();

          // If cache is less than 5 minutes old
          if (currentTime - lastFetch < 5 * 60 * 1000) {
            console.log('Using recent cache');
            const parsedPosts = JSON.parse(cachedPostsStr);
            setPosts(parsedPosts);
            extractAndSetTags(parsedPosts);
            setLoading(false);

            // Still fetch in background after a delay
            fetchTimeoutRef.current = setTimeout(() => {
              fetchPosts(true);
            }, 1000);

            return;
          }
        }
      }

      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        throw new Error('No network connection');
      }

      const actualConnectivity = await checkActualConnectivity();
      if (!actualConnectivity) {
        throw new Error('Cannot reach server');
      }

      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const response = await fetch(`${API_URL}/posts/my-posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      if (response.status === 401) {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        router.replace('/pages/auth');
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao buscar posts');

      const fetchedPosts = data.posts || [];
      setPosts(fetchedPosts);

      // Cache posts with timestamp
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_POSTS, JSON.stringify(fetchedPosts));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_FETCH, Date.now().toString());

      extractAndSetTags(fetchedPosts);
      setIsOffline(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      const cachedPosts = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_POSTS);
      if (cachedPosts) {
        const parsedPosts = JSON.parse(cachedPosts);
        setPosts(parsedPosts);
        extractAndSetTags(parsedPosts);
      }
      setIsOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, checkActualConnectivity]);

  // Extract function to get tags from posts to avoid code duplication
  const extractAndSetTags = useCallback((postArray: any[]) => {
    const tagsSet = new Set<string>();
    postArray.forEach((post: any) => {
      if (post.tags) post.tags.forEach((tag: string) => tagsSet.add(tag));
    });
    setAllTags(Array.from(tagsSet));
  }, []);

  const loadOfflinePosts = useCallback(async () => {
    const offlinePostsStr = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_POSTS);
    const offlinePosts = offlinePostsStr ? JSON.parse(offlinePostsStr) : [];
    setOfflinePosts(offlinePosts);
  }, []);

  const clearOldCachePosts = useCallback(async () => {
    try {
      const cachedPostsStr = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_POSTS);
      if (!cachedPostsStr) return;

      const cachedPosts = JSON.parse(cachedPostsStr);
      const updatedPosts = cachedPosts.filter((post: any) => post.offlineId);

      if (cachedPosts.length !== updatedPosts.length) {
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_POSTS, JSON.stringify(updatedPosts));
      }
    } catch (error) {
      console.error("Erro ao limpar posts antigos:", error);
    }
  }, []);

  const sendOfflinePosts = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;

    try {
      const netInfo = await NetInfo.fetch();
      const isActuallyConnected = await checkActualConnectivity();
      if (!netInfo.isConnected || !isActuallyConnected) {
        setIsOffline(true);
        return;
      }

      const offlinePostsStr = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_POSTS);
      if (!offlinePostsStr) return;

      let offlinePostsArray = JSON.parse(offlinePostsStr);
      if (offlinePostsArray.length === 0) return;

      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);

      // Process posts in chunks for better performance
      const chunkSize = 2;
      for (let i = 0; i < offlinePostsArray.length; i += chunkSize) {
        const chunk = offlinePostsArray.slice(i, i + chunkSize);

        // Process each post in the current chunk
        const processPromises = chunk.map(async (post: any, chunkIndex: number) => {
          const actualIndex = i + chunkIndex;
          if (post.syncFailed) return null;

          const formData = new FormData();
          Object.entries({
            title: post.title || 'Interação sem título',
            content: post.description || '',
            tags: (post.tags || []).join(','),
            location: post.location || '',
            latitude: post.latitude?.toString() || '',
            longitude: post.longitude?.toString() || '',
            weight: post.weight || '0',
            ranking: post.ranking || 'Baixo',
            offlineId: post.offlineId || post.id || '',
          }).forEach(([key, value]) => {
            formData.append(key, value as string);
          });

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
              // Mark for removal
              return actualIndex;
            } else {
              // Mark as failed
              offlinePostsArray[actualIndex].syncFailed = true;
              return null;
            }
          } catch (error) {
            offlinePostsArray[actualIndex].syncFailed = true;
            return null;
          }
        });

        // Wait for all posts in this chunk to be processed
        const results = await Promise.all(processPromises);

        // Remove successfully synced posts (process in reverse to avoid index issues)
        const indexesToRemove = results.filter(index => index !== null).sort((a, b) => (b || 0) - (a || 0));
        for (const index of indexesToRemove) {
          if (index !== null) {
            offlinePostsArray.splice(index, 1);
          }
        }

        // Update storage after each chunk
        await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_POSTS, JSON.stringify(offlinePostsArray));
        setOfflinePosts([...offlinePostsArray]);
      }

      // Refresh posts after syncing
      await fetchPosts(true);
    } finally {
      syncingRef.current = false;
    }
  }, [API_URL, checkActualConnectivity, fetchPosts]);

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

      return () => {
        unsubscribe();
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
      };
    };

    initialize();
  }, [clearOldCachePosts, fetchPosts, loadOfflinePosts, checkActualConnectivity, sendOfflinePosts]);

  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const isValid = await validateToken();
      if (!isValid) return;

      Alert.alert(
        "Confirmar exclusão",
        "Tem certeza que deseja excluir esta postagem?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true);
                const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
                const response = await fetch(`${API_URL}/posts/${postId}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                  setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));

                  // Update cache
                  const cachedPosts = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_POSTS);
                  if (cachedPosts) {
                    const parsed = JSON.parse(cachedPosts);
                    await AsyncStorage.setItem(
                      STORAGE_KEYS.CACHED_POSTS,
                      JSON.stringify(parsed.filter((p: any) => p.id !== postId))
                    );
                  }
                } else {
                  const errorData = await response.json();
                  Alert.alert("Erro", errorData.message || "Erro ao excluir postagem");
                }
              } catch (error) {
                Alert.alert("Erro", "Não foi possível excluir a postagem");
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível processar sua solicitação");
    }
  }, [API_URL]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsRefreshing(true);
    setFilteredPosts([]); // Clear posts during refresh
    await fetchPosts(true);
    setIsRefreshing(false);
  }, [fetchPosts]);

  // Use useMemo for filtered posts to avoid unnecessary recalculations
  useEffect(() => {
    const filterPosts = () => {
      if (isRefreshing) return; // Don't filter during refresh

      let combinedPosts = isOffline
        ? [...posts, ...offlinePosts.map(post => ({ ...post, isOffline: true }))]
        : [...posts];

      let filtered = combinedPosts;

      // Apply tag filtering
      if (selectedTags.length > 0) {
        filtered = filtered.filter(post => {
          if (!post.tags) return false;
          return selectedTags.every(tag => post.tags.includes(tag));
        });
      }

      // Apply search filtering
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase().trim();
        filtered = filtered.filter(post => {
          const title = (post.title || '').toLowerCase();
          const content = (post.content || post.description || '').toLowerCase();
          const location = (post.location || '').toLowerCase();
          const tagsText = (post.tags || []).join(' ').toLowerCase();

          return (
            title.includes(query) ||
            content.includes(query) ||
            location.includes(query) ||
            tagsText.includes(query)
          );
        });
      }

      setFilteredPosts(filtered);
    };

    filterPosts();
  }, [posts, offlinePosts, isOffline, selectedTags, debouncedSearchQuery, isRefreshing]);

  return (
    <View style={styles.container}>
      {isOffline && <OfflineMessage />}

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleRefresh={handleRefresh}
      />

      <TagFilter
        allTags={allTags}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
      />

      {(loading || refreshing) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <PostList
          filteredPosts={filteredPosts}
          handleDeletePost={handleDeletePost}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
