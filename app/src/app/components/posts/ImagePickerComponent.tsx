import React from "react";
import { View, Pressable, Image, StyleSheet, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

interface ImagePickerProps {
  image: string | null;
  setImage: (image: string | null) => void;
}

const ImagePickerComponent = ({ image, setImage }: ImagePickerProps) => {
  const pickImage = async () => {
    if (image) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <View>
      <Pressable
        onPress={pickImage}
        style={[styles.imagePicker, image && styles.imagePickerDisabled]}
        disabled={!!image}
      >
        <Ionicons name="camera-outline" size={24} color="#fff" />
      </Pressable>
      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <Pressable onPress={removeImage} style={styles.removeImageButton}>
            <Text style={styles.removeImageText}>x</Text>
          </Pressable>
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