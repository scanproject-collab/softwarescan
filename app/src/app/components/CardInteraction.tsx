// components/CardInteraction.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, PressableProps } from 'react-native';

interface InteractionCardProps {
  location: string;
  hasImage: boolean;
  tags: string[];
  onPress: PressableProps['onPress'];
}

const InteractionCard: React.FC<InteractionCardProps> = ({ location, hasImage, tags, onPress }) => (
  <Pressable onPress={onPress}>
    <View style={styles.card}>
      
      
      <View style={styles.tagsContainer}>
        {tags?.map((tag: string, index: number) => (
          <Text key={index} style={styles.tagText}>{tag}</Text>
        ))}
      </View>
      
      <Text style={styles.locationText}>{location}</Text>
      {hasImage && (
        <Image 
          source={require('@/assets/images/sample-image.jpg')} 
          style={styles.interactionImage}
        />
      )}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shapesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  interactionImage: {
    width: '100%',
    height: 150,
    marginTop: 8,
    borderRadius: 4,
  },
});

export default InteractionCard;