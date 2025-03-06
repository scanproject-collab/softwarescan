import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Footer: React.FC = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2025 Scan. Todos os direitos reservados.</Text>
      <Text style={styles.text}>Desenvolvido por Scan</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#D2691E', 
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 14,
  },
});

export default Footer;