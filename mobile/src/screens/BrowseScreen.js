import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image
} from 'react-native';
import { getListings } from '../api/listings';
import { COLORS } from '../../../shared/constants/colors';

export default function BrowseScreen({ navigation }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const data = await getListings();
            setListings(data);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ItemDetail', { listing: item })}
        >
            <Image
                source={{ uri: item.images?.split(',')[0] || 'https://via.placeholder.com/150' }}
                style={styles.image}
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.price}>${item.price}</Text>
                <Text style={styles.category}>{item.category}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.green} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🚲 UniCycle</Text>
            </View>
            <FlatList
                data={listings}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.list}
                refreshing={loading}
                onRefresh={fetchListings}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    list: {
        padding: 8,
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
    },
    info: {
        padding: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: COLORS.dark,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.green,
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        color: '#666',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
