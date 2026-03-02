import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { login as loginApi, signup as signupApi, getCurrentUser } from '../api/auth';
import { setLogoutCallback } from '../api/authCallback';
import { registerPushToken } from '../api/users';

const AuthContext = createContext({});

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

async function registerForPushNotifications() {
    if (Platform.OS === 'web') return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return null;
    }

    // Get the Expo push token
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        return tokenData.data;
    } catch (e) {
        console.log('[push] Could not get push token:', e);
        return null;
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // Load user from storage on app start
    useEffect(() => {
        loadUser();
    }, []);

    // Register for push notifications when user logs in
    useEffect(() => {
        if (user) {
            registerForPushNotifications().then((pushToken) => {
                if (pushToken) {
                    registerPushToken(pushToken).catch((e) =>
                        console.log('[push] Failed to register push token:', e)
                    );
                }
            });
        }
    }, [user?.id]);

    const loadUser = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Refresh user data from server
                try {
                    const freshUser = await getCurrentUser();
                    setUser(freshUser);
                    await AsyncStorage.setItem('user', JSON.stringify(freshUser));
                } catch (err) {
                    console.error('Failed to refresh user:', err);
                }
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await loginApi(email, password);
        setToken(data.access_token);
        setUser(data.user);

        await AsyncStorage.setItem('token', data.access_token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        return data;
    };

    const signup = async (name, email, password, university) => {
        const data = await signupApi(name, email, password, university);
        // Note: signup doesn't log in automatically, user needs to verify email
        return data;
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    };

    // Register logout so the axios interceptor can call it on 401/suspended 403
    useEffect(() => {
        setLogoutCallback(logout);
    }, []);

    const updateUser = async (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            signup,
            logout,
            updateUser,
            isAuthenticated: !!user && !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
