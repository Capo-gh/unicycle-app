import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';

export default function ItemDetailScreen({ route }) {
    const { listing } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image
                    source={{ uri: listing.images?.split(',')[0] || 'https://via.placeholder.com/400' }}
                    style={styles.image}
                />

                <View style={styles.content}>
                    <Text style={styles.title}>{listing.title}</Text>
                    <Text style={styles.price}>${listing.price}</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Category</Text>
                        <Text style={styles.sectionText}>{listing.category}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Condition</Text>
                        <Text style={styles.sectionText}>{listing.condition}</Text>
                    </View>

                    {listing.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.sectionText}>{listing.description}</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>I'm Interested</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#f0f0f0',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 8,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.green,
        marginBottom: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    sectionText: {
        fontSize: 16,
        color: COLORS.dark,
    },
    button: {
        backgroundColor: COLORS.green,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
