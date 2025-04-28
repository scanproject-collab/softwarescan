import React, { useCallback } from "react";
import { TextInput, Text, View, StyleSheet } from "react-native";

interface TimeInputProps {
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

const TimeInput = ({ selectedTime, setSelectedTime }: TimeInputProps) => {
  // Função para validar e formatar a entrada de hora
  const handleTimeChange = useCallback((text: string) => {
    // Remover caracteres não numéricos exceto :
    let formatted = text.replace(/[^\d:]/g, '');

    // Limitar a entrada a 5 caracteres (hh:mm)
    if (formatted.length > 5) {
      formatted = formatted.substring(0, 5);
    }

    // Adicionar o : automaticamente após 2 dígitos se não existir
    if (formatted.length === 2 && !formatted.includes(':')) {
      formatted += ':';
    }

    // Validar horas e minutos
    if (formatted.includes(':')) {
      const [hours, minutes] = formatted.split(':');

      // Validar que horas estão entre 0-23
      if (hours && parseInt(hours) > 23) {
        formatted = '23' + formatted.substring(2);
      }

      // Validar que minutos estão entre 0-59
      if (minutes && parseInt(minutes) > 59) {
        formatted = formatted.split(':')[0] + ':59';
      }
    }

    setSelectedTime(formatted);
  }, [setSelectedTime]);

  return (
    <View>
      <Text style={styles.sectionTitle}>Hora</Text>
      <TextInput
        style={styles.input}
        placeholder="hh:mm (ex.: 14:30)"
        value={selectedTime}
        onChangeText={handleTimeChange}
        keyboardType="numeric"
        maxLength={5}
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

export default React.memo(TimeInput);