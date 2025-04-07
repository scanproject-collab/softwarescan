import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import InteractionCard from '../InteractionCard';
import { router } from 'expo-router';
import { Alert } from 'react-native';

const isPostRecent = (post: any): boolean => {
  // Check if post has a creation date field
  const createdAt = post.created_at || post.createdAt || post.date || post.created;
  
  if (!createdAt) return false;
  
  // Parse the date
  const postDate = new Date(createdAt);
  if (isNaN(postDate.getTime())) return false;
  
  // Get current date
  const now = new Date();
  
  // Calculate difference in days
  const differenceInTime = now.getTime() - postDate.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  
  // Consider as recent if less than 2 days old
  return differenceInDays < 2;
};

interface PostListProps {
  filteredPosts: any[];
  handleDeletePost: (postId: string) => void;
}

const PostList = ({ filteredPosts, handleDeletePost }: PostListProps) => {
  return (
    <FlatList
      data={filteredPosts}
      renderItem={({ item }) => (
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
      )}
      keyExtractor={(item) => item.isOffline ? `offline-${item.id}` : item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filteredPosts.length === 0 ? 'Nenhuma interação disponível. Crie uma nova!' : 'Nenhum post encontrado.'}
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 80 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#666', textAlign: 'center', fontWeight: '500' },
});

export default PostList;