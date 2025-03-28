import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '../utils/validateAuth';
import { router } from 'expo-router';
import Navbar from '../components/navbar';

export default function TabsLayout() {
    useEffect(() => {
        const checkToken = async () => {
            const isValid = await validateToken();
            if (!isValid) {
                console.log('Token inválido ou expirado, redirecionando para login');
                await AsyncStorage.removeItem('userToken');
                router.replace('/pages/auth');
            }
        };

        checkToken();
    }, []);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#092B6E',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIconStyle: styles.tabBarIcon,
                headerShown: true,
                header: () => <Navbar />,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                    tabBarButton: (props) => (
                        <Pressable {...props} style={[styles.tabButton, styles.leftTab]} />
                    ),
                }}
            />

            <Tabs.Screen
                name="newInteraction"
                options={{
                    title: '+',
                    tabBarIcon: ({ size }) => (
                        <Ionicons name="add" color="#fff" size={size + 2} />
                    ),
                    tabBarLabel: () => null,
                    tabBarButton: (props) => (
                        <Pressable {...props} style={styles.addButton} />
                    ),
                    tabBarStyle: { display: 'none' },
                }}
            />

            <Tabs.Screen
                name="myPerceptions"
                options={{
                    title: 'Map',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map-outline" color={color} size={size} />
                    ),
                    tabBarButton: (props) => (
                        <Pressable {...props} style={[styles.tabButton, styles.rightTab]} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 0,
        elevation: 8,
        height: 60,
        borderRadius: 30,
        marginHorizontal: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    tabBarIcon: {
        marginTop: 4,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        top: -5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#092B6E',
        width: 50,
        height: 50,
        borderRadius: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: -25 }],
    }
});