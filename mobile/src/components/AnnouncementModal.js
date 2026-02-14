import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getActiveAnnouncement, dismissAnnouncement } from '../api/announcements';
import { COLORS } from '../../../shared/constants/colors';

export default function AnnouncementModal() {
    const [announcement, setAnnouncement] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const data = await getActiveAnnouncement();
            if (data && data.id) {
                setAnnouncement(data);
                setVisible(true);
            }
        } catch (err) {}
    };

    const handleDismiss = async () => {
        if (announcement) {
            try {
                await dismissAnnouncement(announcement.id);
            } catch (err) {}
        }
        setVisible(false);
    };

    if (!announcement) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleDismiss}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
                        <Ionicons name="close" size={22} color="#666" />
                    </TouchableOpacity>

                    {/* Image */}
                    {announcement.image_url && (
                        <Image
                            source={{ uri: announcement.image_url }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    )}

                    {/* Content */}
                    <View style={styles.content}>
                        <View style={styles.iconRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="megaphone" size={18} color={COLORS.green} />
                            </View>
                            <Text style={styles.title}>{announcement.title}</Text>
                        </View>

                        <Text style={styles.message}>{announcement.message}</Text>

                        <View style={styles.actions}>
                            {announcement.action_text && (
                                <TouchableOpacity style={styles.actionButton} onPress={handleDismiss}>
                                    <Text style={styles.actionButtonText}>{announcement.action_text}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.dismissButton, !announcement.action_text && { flex: 1 }]}
                                onPress={handleDismiss}
                            >
                                <Text style={styles.dismissButtonText}>
                                    {announcement.action_text ? 'Not Now' : 'Got It'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 180,
    },
    content: {
        padding: 24,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        flex: 1,
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: COLORS.green,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    dismissButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    dismissButtonText: {
        color: '#666',
        fontSize: 15,
        fontWeight: '600',
    },
});
