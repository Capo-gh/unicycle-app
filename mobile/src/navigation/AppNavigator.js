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
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import BrowseScreen from '../screens/BrowseScreen';
import MessagesScreen from '../screens/MessagesScreen';
import RequestsScreen from '../screens/RequestsScreen';
import SellScreen from '../screens/SellScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import MyInterestsScreen from '../screens/MyInterestsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import EditListingScreen from '../screens/EditListingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PrivacySafetyScreen from '../screens/PrivacySafetyScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutScreen from '../screens/AboutScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import AnnouncementModal from '../components/AnnouncementModal';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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
            <Stack.Screen
                name="UserProfile"
                component={UserProfileScreen}
                options={{
                    headerShown: true,
                    title: 'Seller Profile',
                    headerBackTitle: 'Back'
                }}
            />
        </Stack.Navigator>
    );
}

// Profile Stack (for Activity, Settings, etc.)
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
                    title: 'Activity',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: true, title: 'Notifications', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: true, title: 'Settings', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
                name="MyListings"
                component={MyListingsScreen}
                options={{
                    headerShown: true,
                    title: 'My Listings',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="EditListing"
                component={EditListingScreen}
                options={{
                    headerShown: true,
                    title: 'Edit Listing',
                    headerBackTitle: 'Back'
                }}
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
            <Stack.Screen
                name="UserProfile"
                component={UserProfileScreen}
                options={{
                    headerShown: true,
                    title: 'Seller Profile',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="PrivacySafety"
                component={PrivacySafetyScreen}
                options={{ headerShown: true, title: 'Privacy & Safety', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
                name="HelpSupport"
                component={HelpSupportScreen}
                options={{ headerShown: true, title: 'Help & Support', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
                name="About"
                component={AboutScreen}
                options={{ headerShown: true, title: 'About', headerBackTitle: 'Back' }}
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
            {isAuthenticated ? (
                <>
                    <MainTabs />
                    <AnnouncementModal />
                </>
            ) : <AuthStack />}
        </NavigationContainer>
    );
}
