import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';

// Import screens (we'll create these next)
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import BrowseScreen from '../screens/BrowseScreen';
import MessagesScreen from '../screens/MessagesScreen';
import RequestsScreen from '../screens/RequestsScreen';
import SellScreen from '../screens/SellScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import MyInterestsScreen from '../screens/MyInterestsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
    );
}

// Main Tab Navigator
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Browse') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Requests') {
                        iconName = focused ? 'megaphone' : 'megaphone-outline';
                    } else if (route.name === 'Sell') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Messages') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.green,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Browse" component={BrowseStack} />
            <Tab.Screen name="Requests" component={RequestsScreen} />
            <Tab.Screen name="Sell" component={SellScreen} />
            <Tab.Screen name="Messages" component={MessagesScreen} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
}

// Browse Stack (for navigating to item details)
function BrowseStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="BrowseList"
                component={BrowseScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ItemDetail"
                component={ItemDetailScreen}
                options={{
                    headerShown: true,
                    title: 'Item Details',
                    headerBackTitle: 'Back'
                }}
            />
        </Stack.Navigator>
    );
}

// Profile Stack (for Transactions, Settings, etc.)
function ProfileStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="MyInterests"
                component={MyInterestsScreen}
                options={{
                    headerShown: true,
                    title: 'Transactions',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ItemDetail"
                component={ItemDetailScreen}
                options={{
                    headerShown: true,
                    title: 'Item Details',
                    headerBackTitle: 'Back'
                }}
            />
        </Stack.Navigator>
    );
}

// Main Navigator
export default function AppNavigator() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        // You can create a LoadingScreen component here
        return null;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
}
