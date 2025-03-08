import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, PressableProps } from 'react-native';

interface InteractionCardProps {
  title: string;
  imageUrl?: string;
  hasImage: boolean;
  tags: string[];
  onPress: PressableProps['onPress'];
}

const InteractionCard: React.FC<InteractionCardProps> = ({  imageUrl, hasImage, tags, onPress, title }) => (
  <Pressable onPress={onPress}>
    <View style={styles.card}>

      <Text style={styles.locationText}>Titulo: {title}</Text>
      {hasImage && imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.interactionImage}
          key={imageUrl}
          onError={(e) => console.log('Erro ao carregar imagem:', e.nativeEvent.error)}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>Sem Imagem</Text>
        </View>
      )}
      <View style={styles.tagsContainer}>
        {tags?.map((tag: string, index: number) => (
            <Text key={index} style={styles.tagText}>{tag}</Text>
        ))}
      </View>

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
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 10,
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
  placeholderImage: {
    width: '100%',
    height: 150,
    marginTop: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
});

export default InteractionCard;