import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ImagePickerProps {
  image: string | null;
  setImage: (image: string | null) => void;
}

const ImagePickerComponent = ({ image, setImage }: ImagePickerProps) => {
  const pickImage = async () => {
    if (image) return;

    try {
      // Check permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "We need permission to access the gallery.");
        return;
      }

      console.log("Opening gallery for image selection...");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });
      
      if (!result.canceled) {
        console.log("Image selected:", result.assets[0].uri);

        const compressedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        console.log("Image compressed:", compressedImage.uri);
        setImage(compressedImage.uri);
      } else {
        console.log("Image selection cancelled.");
      }
    } catch (error) {
      console.error("Error selecting or manipulating image:", error);
      Alert.alert("Error", "There was a problem selecting or cropping the image. Please try again.");
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={pickImage}
        style={[styles.imagePicker, image && styles.imagePickerDisabled]}
        disabled={!!image}
      >
        <Ionicons name="camera-outline" size={24} color="#fff" />
      </TouchableOpacity>
      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity onPress={removeImage} style={styles.removeImageButton}>
            <Text style={styles.removeImageText}>x</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  imagePickerDisabled: { backgroundColor: "#99ccff", opacity: 0.6 },
  imageContainer: { position: "relative", marginBottom: 16, alignSelf: "center" },
  imagePreview: { width: 200, height: 200, borderRadius: 12, marginBottom: 16, alignSelf: "center" },
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
  removeImageText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});

export default ImagePickerComponent;