import React, { memo, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import InteractionCard from '../InteractionCard';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Cache for calculated "isRecent" values to avoid recalculation
const recentPostsCache = new Map<string, boolean>();

const isPostRecent = (post: any): boolean => {
  // Check if we have the result cached
  const cacheKey = `${post.id}-${post.created_at || post.createdAt || post.date || post.created}`;
  if (recentPostsCache.has(cacheKey)) {
    return recentPostsCache.get(cacheKey) as boolean;
  }

  const createdAt = post.created_at || post.createdAt || post.date || post.created;

  if (!createdAt) return false;

  const postDate = new Date(createdAt);
  if (isNaN(postDate.getTime())) return false;

  const now = new Date();

  const differenceInTime = now.getTime() - postDate.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

  const isRecent = differenceInDays < 2;

  // Cache the result
  recentPostsCache.set(cacheKey, isRecent);

  return isRecent;
};

// Clear cache occasionally to prevent memory leaks
setInterval(() => {
  if (recentPostsCache.size > 1000) {
    recentPostsCache.clear();
  }
}, 60000); // Clear every minute if cache gets too large

interface PostListProps {
  filteredPosts: any[];
  handleDeletePost: (postId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const PostList = ({ filteredPosts, handleDeletePost, refreshing = false, onRefresh }: PostListProps) => {
  // Memoize the renderItem function to prevent recreating it on every render
  const renderItem = useCallback(({ item }: { item: any }) => (
    <InteractionCard
      title={item.title || 'Sem Título'}
      location={item.location || 'Local não especificado'}
      imageUrl={item.image || item.imageUrl}
      hasImage={!!(item.image || item.imageUrl)}
      tags={item.tags || []}
      isRecent={isPostRecent(item)}
      onPress={() => {
        if (item.isOffline) {
          Alert.alert('Post Offline', 'Este post será sincronizado quando houver conexão.');
        } else {
          router.push(`/pages/posts/${item.id}`);
        }
      }}
      onDelete={item.isOffline ? undefined : () => handleDeletePost(item.id)}
      isOffline={item.isOffline}
    />
  ), [handleDeletePost]);

  // Memoize the keyExtractor to avoid recreating it on each render
  const keyExtractor = useCallback((item: any) =>
    item.isOffline ? `offline-${item.id}` : item.id,
    []);

  // Memoize the empty component
  const EmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {filteredPosts.length === 0 ? 'Nenhuma interação disponível. Crie uma nova!' : 'Nenhum post encontrado.'}
      </Text>
    </View>
  ), [filteredPosts.length]);

  return (
    <FlatList
      data={filteredPosts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<EmptyComponent />}
      removeClippedSubviews={true} // Improve performance by unmounting components that are off screen
      maxToRenderPerBatch={10} // Render fewer items per batch to reduce blocking time
      windowSize={5} // Reduce the render window to improve performance
      initialNumToRender={10} // Render fewer items initially for faster first render
      updateCellsBatchingPeriod={50} // Batch update frequency
      onEndReachedThreshold={0.5} // Begin loading next items when halfway through the list
      getItemLayout={(data, index) => (
        // Provide dimensions for each item to improve load time
        { length: 280, offset: 280 * index, index }
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF6633']}
          tintColor={'#FF6633'}
          progressBackgroundColor={'#FFFFFF'}
          progressViewOffset={10}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 80 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#666', textAlign: 'center', fontWeight: '500' },
});

// Memoize the entire component
export default memo(PostList);