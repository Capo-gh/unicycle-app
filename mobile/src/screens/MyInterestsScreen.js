import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image,
    TouchableOpacity
} from 'react-native';
import { getMyTransactions } from '../api/transactions';
import { COLORS } from '../../../shared/constants/colors';

export default function MyInterestsScreen({ navigation }) {
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterests();
    }, []);

    const fetchInterests = async () => {
        try {
            const data = await getMyTransactions(true);
            setInterests(data);
        } catch (error) {
            console.error('Error fetching interests:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ItemDetail', { listing: item.listing })}
        >
            <Image
                source={{ uri: item.listing?.images?.split(',')[0] || 'https://via.placeholder.com/80' }}
                style={styles.image}
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.listing?.title || 'Untitled'}
                </Text>
                <Text style={styles.price}>${item.listing?.price || '0'}</Text>
                <Text style={styles.status}>{item.status}</Text>
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
            <FlatList
                data={interests}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emoji}>❤️</Text>
                        <Text style={styles.emptyText}>No interests yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.green,
        marginBottom: 4,
    },
    status: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        alignItems: 'center',
        marginTop: 64,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});
