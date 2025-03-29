import React from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from "react-native";

interface SubmitButtonProps {
  loading: boolean;
  handleSubmit: () => void;
  router: any;
  isOffline: boolean;
}

const SubmitButton = ({ loading, handleSubmit, router, isOffline }: SubmitButtonProps) => {
  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {isOffline ? "Salvar Localmente" : "Salvar"}
          </Text>
        )}
      </Pressable>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Cancelar</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 80,
  },
  submitButton: {
    backgroundColor: "#FF6633",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  submitButtonDisabled: { backgroundColor: "#99ccff" },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  backButton: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
    flex: 1,
  },
  backButtonText: { color: "#007AFF", fontSize: 16, fontWeight: "600" },
});

export default SubmitButton;