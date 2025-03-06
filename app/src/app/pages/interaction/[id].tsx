// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Pressable, 
} from 'react-native';
import WebView from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

const mockInteraction = {
  id: '1',
  location: 'Quebrada 01',
  date: '01/01/2001',
  time: '00:00',
  description: 'Foto tirada em um muro residencial.',
  image: require('@/assets/images/sample-image.jpg'),
  latitude: -23.5505, 
  longitude: -46.6333,
  tags: ['pichação', 'CV'], 
};

const mapHtml = (lat: number, lng: number, apiKey: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width">
      <script src="https://js.api.here.com/v3/3.1/mapsjs-core.js"></script>
      <script src="https://js.api.here.com/v3/3.1/mapsjs-service.js"></script>
      <script src="https://js.api.here.com/v3/3.1/mapsjs-ui.js"></script>
      <script src="https://js.api.here.com/v3/3.1/mapsjs-mapevents.js"></script>
      <link rel="stylesheet" href="https://js.api.here.com/v3/3.1/mapsjs-ui.css" />
      <style>
        html, body, #map {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <div id="map" style="width: 100%; height: 100%;"></div>
      <script>
        const platform = new H.service.Platform({
          'apikey': '${apiKey}'
        });
        const defaultLayers = platform.createDefaultLayers();
        const map = new H.Map(document.getElementById('map'),
          defaultLayers.vector.normal.map, {
          center: { lat: ${lat}, lng: ${lng} },
          zoom: 14,
          pixelRatio: window.devicePixelRatio || 1
        });
        const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        const ui = H.ui.UI.createDefault(map, defaultLayers);

        // Add a marker
        const marker = new H.map.Marker({ lat: ${lat}, lng: ${lng} });
        map.addObject(marker);
      </script>
    </body>
  </html>
`;

export default function InteractionDetail() {
  const {  } = useLocalSearchParams();
  const [location, setLocation] = useState({ latitude: mockInteraction.latitude, longitude: mockInteraction.longitude });
  const HERE_API_KEY = process.env.EXPO_PUBLIC_API_KEY_MAP; 

  useEffect(() => {

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });
    })();
  }, []);

  const interaction = mockInteraction;

  return (
    <View style={styles.container}>
     
      <Image 
        source={interaction.image} 
        style={styles.interactionImage}
      />
      
      <View style={styles.detailsContainer}>
        <View style={styles.tagsContainer}>
          {interaction.tags.map((tag, index) => (
            <Text key={index} style={styles.tagText}>{tag}</Text>
          ))}
        </View>
        <Text style={styles.detailText}>Data: {interaction.date}</Text>
        <Text style={styles.detailText}>Hora: {interaction.time}</Text>
        <Text style={styles.detailText}>Observações: {interaction.description}</Text>
        <Text style={styles.detailText}>Local: {interaction.location}</Text>
      </View>
      
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml(location.latitude, location.longitude, HERE_API_KEY) }}
        style={styles.map}
      />
      
      <Pressable 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
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
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
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