import React from "react";
import { TextInput, Text, View, StyleSheet } from "react-native";

interface TitleInputProps {
  title: string;
  setTitle: (title: string) => void;
  isOffline: boolean;
}

const TitleInput = ({ title, setTitle, isOffline }: TitleInputProps) => {
  return (
    <View>
      {isOffline && (
        <View style={styles.offlineMessage}>
          <Text style={styles.offlineText}>Você está offline</Text>
        </View>
      )}
      <Text style={styles.sectionTitle}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o título da interação"
        value={title}
        onChangeText={setTitle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 16, marginBottom: 8 },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },
  offlineMessage: { backgroundColor: "#ffeb3b", padding: 10, borderRadius: 8, marginBottom: 12 },
  offlineText: { color: "#333", fontWeight: "500", textAlign: "center" },
});

export default TitleInput;