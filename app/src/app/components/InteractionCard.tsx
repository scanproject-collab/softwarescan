import React, { memo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, PressableProps, ActivityIndicator } from 'react-native';
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

// Custom image component with loading state
const OptimizedImage = memo(({ uri, style }: { uri: string, style: any }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={[style, { position: 'relative' }]}>
      {isLoading && (
        <View style={[style, styles.imageLoadingContainer]}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}

      {hasError ? (
        <View style={[style, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>Falha ao carregar</Text>
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={style}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </View>
  );
});

// Memoized tags component to prevent rerendering
const TagsList = memo(({ tags }: { tags: string[] }) => (
  <View style={styles.tagsContainer}>
    {tags?.map((tag: string, index: number) => (
      <Text key={index} style={styles.tagText} numberOfLines={1}>{tag}</Text>
    ))}
  </View>
));

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
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.card,
      pressed && styles.cardPressed
    ]}
  >
    <View>
      <View style={styles.header}>
        <Text style={styles.locationText} numberOfLines={2}>{title}</Text>
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
        <OptimizedImage uri={imageUrl} style={styles.interactionImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>Sem Imagem</Text>
        </View>
      )}
      <TagsList tags={tags} />
      <View style={styles.locationContainer}>
        <Text style={styles.locationValue} numberOfLines={2}>{location}</Text>
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
  cardPressed: {
    backgroundColor: '#EBEBEB',
    opacity: 0.9,
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
    maxWidth: 150,
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
  imageLoadingContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

// Memoize the component to prevent unnecessary re-renders
export default memo(InteractionCard);