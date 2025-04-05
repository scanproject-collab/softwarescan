import React from "react";
import { TextInput, Text, View, StyleSheet } from "react-native";

interface DescriptionInputProps {
  description: string;
  setDescription: (description: string) => void;
}

const DescriptionInput = ({ description, setDescription }: DescriptionInputProps) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Digite a descrição da interação"
        value={description}
        onChangeText={setDescription}
        multiline
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
  textArea: { height: 100, textAlignVertical: "top", paddingVertical: 12 },
});

export default DescriptionInput;