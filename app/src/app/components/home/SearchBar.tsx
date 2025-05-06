import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

interface SearchBarProps {
  value: string;
  onChangeText: (query: string) => void;
  onClear: () => void;
}

const SearchBar = ({ value, onChangeText, onClear }: SearchBarProps) => {

  const showRefreshHint = () => {
    Toast.show({
      type: 'info',
      text1: 'Dica',
      text2: 'Puxe a lista para baixo para atualizar os dados',
      position: 'top',
      visibilityTime: 3000,
      topOffset: 60,
      props: {
        containerStyle: {
          zIndex: 9999,
          elevation: 9999
        }
      }
    });
  };

  return (
    <View style={styles.headerContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar por título ou descrição..."
        value={value}
        onChangeText={onChangeText}
      />
      <View style={styles.iconsContainer}>
        {value ? (
          <Pressable onPress={onClear} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </Pressable>
        ) : null}
        <Pressable onPress={showRefreshHint} style={styles.helpIcon}>
          <Ionicons name="help-circle" size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 36,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearIcon: {
    position: 'absolute',
    right: 50,
    padding: 5,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#092B6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default SearchBar;