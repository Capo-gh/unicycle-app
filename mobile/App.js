import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n/index';

export default function App() {
    return (
        <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
        </AuthProvider>
    );
}
