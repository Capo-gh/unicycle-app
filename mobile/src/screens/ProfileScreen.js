import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
    RefreshControl,
    Modal,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { getMyListings } from '../api/listings';
import { getMyStats, getMyTransactions } from '../api/transactions';
import { updateProfile } from '../api/users';
import NotificationBell from '../components/NotificationBell';

export default function ProfileScreen({ navigation }) {
    const { user, logout, updateUser } = useAuth();
    const [myListings, setMyListings] = useState([]);
    const [myInterests, setMyInterests] = useState([]);
    const [incomingTransactions, setIncomingTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [savingName, setSavingName] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [listingsData, interestsData, incomingData, statsData] = await Promise.all([
                getMyListings(),
                getMyTransactions(true),  // as_buyer = true
                getMyTransactions(false), // as_seller (incoming)
                getMyStats()
            ]);
            setMyListings(listingsData);
            setMyInterests(interestsData);
            setIncomingTransactions(incomingData);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            if (error.response?.status === 401) {
                Alert.alert('Error', 'Please log in to view your profile');
            } else {
                Alert.alert('Error', 'Failed to load profile data');
            }
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const handleSaveName = async () => {
        const trimmed = nameInput.trim();
        if (!trimmed) return;
        setSavingName(true);
        try {
            const updated = await updateProfile({ name: trimmed });
            await updateUser({ name: updated.name });
            setShowEditModal(false);
        } catch {
            Alert.alert('Error', 'Failed to update name. Please try again.');
        } finally {
            setSavingName(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Ionicons key={i} name="star" size={16} color="#fbbf24" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Ionicons key={i} name="star-half" size={16} color="#fbbf24" />);
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={16} color="#d1d5db" />);
            }
        }
        return stars;
    };

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} />
                }
            >
                {/* Gradient Header */}
                <LinearGradient
                    colors={['#4F46E5', COLORS.green]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <NotificationBell onPress={() => navigation.navigate('Notifications')} color="#fff" />
                            <TouchableOpacity
                                style={styles.settingsButton}
                                onPress={() => navigation.navigate('Settings')}
                            >
                                <Ionicons name="settings-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            {user?.avatar_url ? (
                                <Image source={{ uri: user.avatar_url }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                            ) : (
                                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                            )}
                        </View>
                        <View style={styles.profileDetails}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name}>{user?.name || 'User'}</Text>
                                {user?.is_verified && (
                                    <View style={styles.verifiedBadge}>
                                        <Ionicons name="shield-checkmark" size={14} color="#fff" />
                                        <Text style={styles.verifiedText}>Verified</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={() => { setNameInput(user?.name || ''); setShowEditModal(true); }}
                                    style={styles.editNameButton}
                                >
                                    <Ionicons name="pencil" size={14} color="rgba(255,255,255,0.8)" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.university}>{user?.university || ''}</Text>
                            <View style={styles.ratingRow}>
                                <View style={styles.stars}>
                                    {renderStars(user?.avg_rating || 0)}
                                </View>
                                <Text style={styles.ratingText}>
                                    {(user?.avg_rating || 0).toFixed(1)} ({user?.review_count || 0} reviews)
                                </Text>
                            </View>
                            <Text style={styles.memberSince}>Member since {memberSince}</Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats?.items_sold || 0}</Text>
                            <Text style={styles.statLabel}>Sold</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats?.items_bought || 0}</Text>
                            <Text style={styles.statLabel}>Bought</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats?.active_listings || 0}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* My Listings Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="pricetag-outline" size={20} color={COLORS.dark} />
                            <Text style={styles.sectionTitle}>My Listings</Text>
                        </View>
                        <Text style={styles.sectionCount}>({myListings.length})</Text>
                    </View>

                    {myListings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="add-circle-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>No listings yet</Text>
                            <Text style={styles.emptySubtext}>Tap the Sell tab to create your first listing</Text>
                        </View>
                    ) : (
                        <>
                            {myListings.slice(0, 3).map((listing) => (
                                <TouchableOpacity
                                    key={listing.id}
                                    style={styles.listingCard}
                                    onPress={() => navigation.navigate('ItemDetail', { listing })}
                                    activeOpacity={0.7}
                                >
                                    {listing.images ? (
                                        <Image
                                            source={{ uri: typeof listing.images === 'string' ? listing.images.split(',')[0] : listing.images[0] }}
                                            style={styles.listingImage}
                                        />
                                    ) : (
                                        <View style={[styles.listingImage, styles.listingImagePlaceholder]}>
                                            <Ionicons name="image-outline" size={32} color="#d1d5db" />
                                        </View>
                                    )}
                                    <View style={styles.listingContent}>
                                        <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
                                        <Text style={styles.listingPrice}>${listing.price}</Text>
                                        <View style={styles.listingBadges}>
                                            <View style={styles.listingBadge}>
                                                <Text style={styles.listingBadgeText}>{listing.category}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.viewAllButton}
                                onPress={() => navigation.navigate('MyListings')}
                            >
                                <Text style={styles.viewAllText}>View All Listings</Text>
                                {myListings.length > 3 && (
                                    <View style={styles.viewAllBadge}>
                                        <Text style={styles.viewAllBadgeText}>+{myListings.length - 3}</Text>
                                    </View>
                                )}
                                <Ionicons name="arrow-forward" size={16} color="#fff" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Menu Items */}
                <View style={styles.menu}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('MyInterests')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="swap-horizontal-outline" size={22} color={COLORS.dark} />
                            <Text style={styles.menuText}>Activity</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={styles.menuCount}>{myInterests.length + incomingTransactions.length}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={logout}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {/* Edit Name Modal */}
            <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowEditModal(false)}>
                    <View style={styles.editModalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.editModalTitle}>Edit Name</Text>
                        <TextInput
                            style={styles.editNameInput}
                            value={nameInput}
                            onChangeText={setNameInput}
                            placeholder="Your name"
                            placeholderTextColor="#bbb"
                            autoFocus
                            maxLength={60}
                        />
                        <View style={styles.editModalButtons}>
                            <TouchableOpacity style={styles.editModalCancel} onPress={() => setShowEditModal(false)}>
                                <Text style={styles.editModalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.editModalSave, (!nameInput.trim() || savingName) && { opacity: 0.5 }]}
                                onPress={handleSaveName}
                                disabled={!nameInput.trim() || savingName}
                            >
                                {savingName
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={styles.editModalSaveText}>Save</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    gradient: {
        paddingTop: 12,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    settingsButton: {
        padding: 8,
    },
    profileInfo: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.green,
    },
    profileDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
    university: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    ratingText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
    },
    memberSince: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
    },
    stats: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 16,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
    },
    sectionCount: {
        fontSize: 14,
        color: '#999',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#999',
        marginTop: 4,
        textAlign: 'center',
    },
    listingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
        paddingRight: 12,
    },
    listingImage: {
        width: 80,
        height: 80,
    },
    listingImagePlaceholder: {
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listingContent: {
        flex: 1,
        padding: 12,
    },
    listingTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    listingPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.green,
        marginBottom: 6,
    },
    listingBadges: {
        flexDirection: 'row',
        gap: 6,
    },
    listingBadge: {
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    soldBadge: {
        backgroundColor: '#fee2e2',
    },
    listingBadgeText: {
        fontSize: 11,
        color: '#666',
        textTransform: 'capitalize',
    },
    soldBadgeText: {
        color: '#991b1b',
    },
    listingActions: {
        justifyContent: 'center',
        paddingRight: 12,
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.green,
        borderRadius: 12,
        paddingVertical: 12,
        gap: 8,
    },
    viewAllText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    viewAllBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    viewAllBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    menu: {
        backgroundColor: '#fff',
        marginTop: 16,
        marginBottom: 32,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuText: {
        fontSize: 16,
        color: COLORS.dark,
    },
    menuCount: {
        fontSize: 14,
        color: '#999',
    },
    logoutText: {
        color: '#ef4444',
    },
    editNameButton: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    editModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 36,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#d1d5db',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    editModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginBottom: 16,
    },
    editNameInput: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111',
        marginBottom: 20,
    },
    editModalButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    editModalCancel: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    editModalCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    editModalSave: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        backgroundColor: COLORS.green,
        alignItems: 'center',
    },
    editModalSaveText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});
