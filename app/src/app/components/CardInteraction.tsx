// components/CardInteraction.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';

const InteractionCard = ({ location, hasImage, onPress }) => (
  <Pressable onPress={onPress}>
    <View style={styles.card}>
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