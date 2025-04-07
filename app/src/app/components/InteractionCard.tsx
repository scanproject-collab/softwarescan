import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InteractionCardProps {
  title: string;
  imageUrl?: string;
  hasImage: boolean;
  tags: string[];
  location: string;
  onPress: PressableProps['onPress'];
  onDelete?: () => void;
  isOffline?: boolean;
  isRecent?: boolean;
}

const InteractionCard: React.FC<InteractionCardProps> = ({
  imageUrl,
  hasImage,
  tags,
  onPress,
  title,
  onDelete,
  location,
  isOffline = false,
  isRecent = false,
}) => (
  <Pressable onPress={onPress}>
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.locationText}>Título: {title}</Text>
        {isOffline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineBadgeText}>Pendente</Text>
          </View>
        )}
        {isRecent && !isOffline && (
          <View style={styles.recentBadge}>
            <Text style={styles.recentBadgeText}>Recente</Text>
          </View>
        )}
        {onDelete && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation(); 
              onDelete();
            }}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </Pressable>
        )}
      </View>
      {hasImage && imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.interactionImage} key={imageUrl} />
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
      <View style={styles.locationContainer}>
        <Text style={styles.locationValue}>{location}</Text>
      </View>
      <View style={styles.detailsButtonContainer}>
        <Pressable 
          style={styles.detailsButton}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Ver detalhes da postagem"
          accessibilityHint="Navega para a página de detalhes desta postagem"
        >
          <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </Pressable>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flexShrink: 1,
    marginRight: 8,
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
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBadge: {
    backgroundColor: '#FF4D4F',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  offlineBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recentBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  recentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  locationValue: {
    fontSize: 14,
    color: '#555',
  },
  detailsButtonContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
});
export default InteractionCard;