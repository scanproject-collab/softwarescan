import React from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from "react-native";

interface SubmitButtonProps {
  loading: boolean;
  handleSubmit: () => void;
  router: any;
  isOffline: boolean;
  status: "idle" | "saving" | "saved" | "error"; // Prop status adicionada
}

const SubmitButton = ({ loading, handleSubmit, router, isOffline, status }: SubmitButtonProps) => {
  const renderButtonContent = () => {
    if (status === "saving") {
      return <ActivityIndicator color="#fff" />;
    } else if (status === "saved") {
      return <Text style={styles.successText}>Salvo!</Text>;
    } else if (status === "error") {
      return <Text style={styles.errorText}>Erro ao salvar</Text>;
    } else {
      return (
        <Text style={styles.submitButtonText}>
          {isOffline ? "Salvar Localmente" : "Salvar"}
        </Text>
      );
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[
          styles.submitButton,
          (loading || status === "saved" || status === "error") && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={loading || status === "saved" || status === "error"}
      >
        {renderButtonContent()}
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
  submitButtonDisabled: {
    backgroundColor: "#99ccff",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
    flex: 1,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SubmitButton;