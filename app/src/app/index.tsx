// index.tsx
import React from 'react';
import { 
  View, 
  Pressable, 
  StyleSheet, 
  FlatList,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import InteractionCard from './components/CardInteraction';

const interactionData = [
  { 
    id: '1', 
    location: 'Quebrada 01', 
    hasImage: true, 
    tags: ['pichação', 'CV'] 
  },
];

export default function Home() {
  return (
    <View style={styles.container}>
      <FlatList
        data={interactionData}
        renderItem={({ item }) => (
          <InteractionCard 
            location={item.location} 
            hasImage={item.hasImage}
            tags={item.tags}
            onPress={() => router.push(`/pages/interaction/${item.id}`)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      
      <Pressable 
        style={styles.addButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 60, 
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});