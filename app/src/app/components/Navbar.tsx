import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AppLogo from './appLogo';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

interface DecodedToken {
  name?: string;
}

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userInitial, setUserInitial] = useState('');

  useEffect(() => {
    const getUserInitial = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        try {
          const decoded = jwt_decode<DecodedToken>(token);
          console.log('Decoded token:', decoded);
          const name = decoded.name || 'User';
          setUserInitial(name.charAt(0).toUpperCase());
        } catch (error) {
          console.error('Error decoding token:', error);
          setUserInitial('?');
        }
      }
    };

    getUserInitial();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setDropdownVisible(false);
    router.replace('/pages/auth');
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.logoContainer}>
        <AppLogo />
      </View>
      <View style={styles.userIconContainer}>
        <TouchableOpacity
          style={styles.userCircle}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.userInitial}>{userInitial}</Text>
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 4,
  },
  logoContainer: {
    flex: 1,
  },
  userIconContainer: {
    position: 'relative',
  },
  userCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'black',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 120,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  dropdownText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default Navbar;