import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import React, { memo, useCallback, useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ImagePickerProps {
  image: string | null;
  setImage: (image: string | null) => void;
}

const ImagePickerComponent = ({ image, setImage }: ImagePickerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const pickImage = useCallback(async () => {
    if (image || isProcessing) return;

    try {
      setIsProcessing(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permissão negada", "Precisamos de permissão para acessar a galeria.");
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
        // Only allow JPG and PNG to save on processing
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        try {
          // More aggressive compression for better performance
          const compressedImage = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 800 } }],
            {
              compress: 0.6, // More compression
              format: ImageManipulator.SaveFormat.JPEG
            }
          );

          setImage(compressedImage.uri);
        } catch (manipulationError) {
          console.error("Error manipulating image:", manipulationError);
          // Fallback to original image if manipulation fails
          setImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Erro", "Houve um problema ao selecionar a imagem. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }, [image, setImage, isProcessing]);

  const removeImage = useCallback(() => {
    setImage(null);
  }, [setImage]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={pickImage}
        style={[
          styles.imagePicker,
          image && styles.imagePickerDisabled,
          isProcessing && styles.imagePickerProcessing
        ]}
        disabled={!!image || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="camera-outline" size={24} color="#fff" />
        )}
      </TouchableOpacity>

      {image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.imagePreview}
            // Add cache control 
            fadeDuration={300}
          />
          <TouchableOpacity
            onPress={removeImage}
            style={styles.removeImageButton}
            activeOpacity={0.7}
          >
            <Text style={styles.removeImageText}>x</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  imagePicker: {
    backgroundColor: "#FF6633",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 20,
    width: 50,
    height: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  imagePickerDisabled: {
    backgroundColor: "#99ccff",
    opacity: 0.6
  },
  imagePickerProcessing: {
    backgroundColor: "#FF6633",
    opacity: 0.8,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
    alignSelf: "center",
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 0,
    alignSelf: "center"
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 59, 48, 0.8)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold"
  },
});

export default memo(ImagePickerComponent);