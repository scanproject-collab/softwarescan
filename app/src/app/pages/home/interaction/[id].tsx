// app/interaction/[id].tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const mockInteraction = {
  id: '1',
  location: 'Quebrada 01',
  date: 'March 5, 2025',
  description: 'Foto tirada em um muro residencial.',
  image: require('@/assets/images/sample-image.jpg'), 
};

export default function InteractionDetail() {
  const { id } = useLocalSearchParams();
  
  const interaction = mockInteraction;

  return (
    <View style={styles.container}>
      <Image 
        source={interaction.image} 
        style={styles.interactionImage}
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.locationText}>Localização: {interaction.location}</Text>
        <Text style={styles.dateText}>Data: {interaction.date}</Text>
        <Text style={styles.descriptionText}>Observações: {interaction.description}</Text>
      </View>
      
      <Pressable 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  interactionImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    width: '30%',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});