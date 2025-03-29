import React from "react";
import { TextInput, Text, View, StyleSheet } from "react-native";

interface TimeInputProps {
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

const TimeInput = ({ selectedTime, setSelectedTime }: TimeInputProps) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Hora</Text>
      <TextInput
        style={styles.input}
        placeholder="hh:mm (ex.: 14:30)"
        value={selectedTime}
        onChangeText={setSelectedTime}
      />
      <Text style={styles.hint}>* Insira a hora em que a foto foi tirada.</Text>
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
  hint: { fontSize: 12, color: "#666", marginBottom: 12 },
});

export default TimeInput;