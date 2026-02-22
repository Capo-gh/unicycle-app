import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { getAllRequests, getRequest, createRequest, createReply, deleteRequest, deleteReply } from '../api/requests';

export default function RequestsScreen({ navigation }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPostForm, setShowPostForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const { user } = useAuth();

    const filters = ['All', 'Urgent', 'Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Sports & Outdoors', 'Kitchen', 'Room Decor', 'Other'];

    useEffect(() => {
        fetchRequests();
    }, [selectedFilter, searchQuery]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const filters_obj = {
                category: selectedFilter !== 'All' ? selectedFilter : undefined,
                search: searchQuery || undefined
            };
            const data = await getAllRequests(filters_obj);
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
            Alert.alert('Error', 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRequest = async (requestId) => {
        try {
            const data = await getRequest(requestId);
            setSelectedRequest(data);
        } catch (error) {
            console.error('Error fetching request:', error);
            Alert.alert('Error', 'Failed to load request details');
        }
    };

    const handleAddRequest = () => {
        fetchRequests();
        setShowPostForm(false);
    };

    const handleAddReply = async (requestId, replyText, parentReplyId = null) => {
        try {
            await createReply(requestId, replyText, parentReplyId);
            const data = await getRequest(requestId);
            setSelectedRequest(data);
            setRequests(prev => prev.map(req => {
                if (req.id === requestId) {
                    return { ...req, reply_count: (req.reply_count || 0) + 1 };
                }
                return req;
            }));
        } catch (error) {
            console.error('Error adding reply:', error);
            Alert.alert('Error', 'Failed to add reply');
        }
    };

    const handleDeleteReply = async (replyId) => {
        Alert.alert('Delete Reply', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteReply(selectedRequest.id, replyId);
                        const data = await getRequest(selectedRequest.id);
                        setSelectedRequest(data);
                    } catch (error) {
                        console.error('Error deleting reply:', error);
                        Alert.alert('Error', 'Failed to delete reply');
                    }
                }
            }
        ]);
    };

    const handleDeleteRequest = async (requestId) => {
        Alert.alert(
            'Delete Request',
            'Are you sure you want to delete this request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteRequest(requestId);
                            setRequests(prev => prev.filter(r => r.id !== requestId));
                            setSelectedRequest(null);
                        } catch (error) {
                            console.error('Error deleting request:', error);
                            Alert.alert('Error', 'Failed to delete request');
                        }
                    }
                }
            ]
        );
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    if (showPostForm) {
        return <PostRequestForm user={user} onBack={() => setShowPostForm(false)} onAddRequest={handleAddRequest} />;
    }

    if (selectedRequest) {
        return (
            <RequestDetail
                request={selectedRequest}
                user={user}
                onBack={() => setSelectedRequest(null)}
                onAddReply={handleAddReply}
                onDelete={handleDeleteRequest}
                onDeleteReply={handleDeleteReply}
                formatTimeAgo={formatTimeAgo}
            />
        );
    }

    const renderRequestItem = ({ item }) => (
        <TouchableOpacity
            style={styles.requestItem}
            onPress={() => handleSelectRequest(item.id)}
        >
            <View style={styles.requestHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.author?.name?.charAt(0) || '?'}</Text>
                </View>
                <View style={styles.requestContent}>
                    <View style={styles.badges}>
                        {item.urgent && (
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentBadgeText}>🔥 URGENT</Text>
                            </View>
                        )}
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{item.category}</Text>
                        </View>
                    </View>
                    <Text style={styles.requestTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.requestDescription} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.requestMeta}>
                        <Text style={styles.metaText}>{item.author?.name}</Text>
                        <Text style={styles.metaText}> • </Text>
                        <Text style={styles.metaText}>{formatTimeAgo(item.created_at)}</Text>
                        <Text style={styles.metaText}> • </Text>
                        <Text style={styles.metaText}>{item.reply_count || 0} replies</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Requests</Text>
                        <Text style={styles.headerSubtitle}>Looking for something?</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.postButton}
                        onPress={() => setShowPostForm(true)}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                    contentContainerStyle={styles.filtersContent}
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterButton,
                                selectedFilter === filter && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                selectedFilter === filter && styles.filterButtonTextActive
                            ]}>
                                {filter === 'Urgent' && '🔥 '}{filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : requests.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyEmoji}>🔍</Text>
                    <Text style={styles.emptyTitle}>No requests found</Text>
                    <Text style={styles.emptySubtitle}>Be the first to post!</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequestItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

// Recursive Reply Component
function ReplyItem({ reply, request, user, depth, onReplyTo, onDeleteReply, formatTimeAgo, maxDepth = 3 }) {
    const isOP = reply.author_id === request.author_id;
    const canReply = depth < maxDepth;
    const canDelete = user?.id === reply.author_id || user?.id === request.author_id;

    return (
        <View style={[styles.replyItem, { marginLeft: depth > 0 ? 16 : 0 }]}>
            {depth > 0 && <View style={styles.replyNestLine} />}
            <View style={styles.replyHeader}>
                <View style={[styles.replyAvatar, depth > 0 && { width: 28, height: 28, borderRadius: 14 }]}>
                    <Text style={[styles.replyAvatarText, depth > 0 && { fontSize: 12 }]}>
                        {reply.author?.name?.charAt(0) || '?'}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.replyAuthor}>{reply.author?.name}</Text>
                        {isOP && (
                            <View style={styles.opBadge}>
                                <Text style={styles.opBadgeText}>OP</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.replyTime}>{formatTimeAgo(reply.created_at)}</Text>
                </View>
                {canDelete && (
                    <TouchableOpacity onPress={() => onDeleteReply(reply.id)} style={{ padding: 4 }}>
                        <Ionicons name="trash-outline" size={16} color="#999" />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.replyText}>{reply.text}</Text>

            {/* Reply action */}
            {canReply && (
                <TouchableOpacity
                    style={styles.replyActionButton}
                    onPress={() => onReplyTo(reply)}
                >
                    <Ionicons name="arrow-undo-outline" size={14} color="#999" />
                    <Text style={styles.replyActionText}>Reply</Text>
                </TouchableOpacity>
            )}

            {/* Nested replies */}
            {reply.child_replies && reply.child_replies.length > 0 && (
                <View style={styles.nestedReplies}>
                    {reply.child_replies.map((childReply) => (
                        <ReplyItem
                            key={childReply.id}
                            reply={childReply}
                            request={request}
                            user={user}
                            depth={depth + 1}
                            onReplyTo={onReplyTo}
                            onDeleteReply={onDeleteReply}
                            formatTimeAgo={formatTimeAgo}
                            maxDepth={maxDepth}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

// Count all replies recursively
function countAllReplies(replies) {
    if (!replies) return 0;
    let count = replies.length;
    for (const reply of replies) {
        if (reply.child_replies) {
            count += countAllReplies(reply.child_replies);
        }
    }
    return count;
}

// Request Detail Component
function RequestDetail({ request, user, onBack, onAddReply, onDelete, onDeleteReply, formatTimeAgo }) {
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    const handleSend = async () => {
        if (!replyText.trim()) return;

        setSending(true);
        try {
            await onAddReply(request.id, replyText.trim(), replyingTo?.id || null);
            setReplyText('');
            setReplyingTo(null);
        } finally {
            setSending(false);
        }
    };

    const handleReplyTo = (reply) => {
        setReplyingTo(reply);
    };

    const isOwner = user?.id === request.author_id;
    const totalReplies = countAllReplies(request.replies);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.detailHeader}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <Text style={styles.detailHeaderTitle}>Request Details</Text>
                    {isOwner && (
                        <TouchableOpacity onPress={() => onDelete(request.id)} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={22} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView style={styles.detailContent}>
                    <View style={styles.requestCard}>
                        <View style={styles.requestCardHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{request.author?.name?.charAt(0) || '?'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.authorName}>{request.author?.name}</Text>
                                <Text style={styles.authorUniversity}>{request.author?.university}</Text>
                            </View>
                            <Text style={styles.requestTime}>{formatTimeAgo(request.created_at)}</Text>
                        </View>

                        <View style={styles.requestCardBadges}>
                            {request.urgent && (
                                <View style={styles.urgentBadge}>
                                    <Text style={styles.urgentBadgeText}>🔥 URGENT</Text>
                                </View>
                            )}
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryBadgeText}>{request.category}</Text>
                            </View>
                            {request.budget_min && request.budget_max && (
                                <View style={styles.budgetBadge}>
                                    <Text style={styles.budgetBadgeText}>
                                        💰 ${request.budget_min} - ${request.budget_max}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.requestCardTitle}>{request.title}</Text>
                        <Text style={styles.requestCardDescription}>{request.description}</Text>
                    </View>

                    <View style={styles.repliesSection}>
                        <Text style={styles.repliesTitle}>
                            Replies ({totalReplies})
                        </Text>

                        {(!request.replies || request.replies.length === 0) ? (
                            <View style={styles.noReplies}>
                                <Text style={styles.noRepliesText}>No replies yet. Be the first to help!</Text>
                            </View>
                        ) : (
                            request.replies.map((reply) => (
                                <ReplyItem
                                    key={reply.id}
                                    reply={reply}
                                    request={request}
                                    user={user}
                                    depth={0}
                                    onReplyTo={handleReplyTo}
                                    onDeleteReply={onDeleteReply}
                                    formatTimeAgo={formatTimeAgo}
                                />
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* Reply Input */}
                <View style={styles.replyInputContainer}>
                    {replyingTo && (
                        <View style={styles.replyingToBar}>
                            <Text style={styles.replyingToText}>
                                Replying to {replyingTo.author?.name}
                            </Text>
                            <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                <Ionicons name="close-circle" size={18} color="#999" />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.replyInput}>
                        <TextInput
                            style={styles.replyTextInput}
                            placeholder={replyingTo ? `Reply to ${replyingTo.author?.name}...` : 'Write a reply...'}
                            value={replyText}
                            onChangeText={setReplyText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!replyText.trim() || sending}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Post Request Form Component
function PostRequestForm({ user, onBack, onAddRequest }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Furniture',
        urgent: false,
        budgetMin: '',
        budgetMax: ''
    });
    const [loading, setLoading] = useState(false);

    const categories = ['Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Sports & Outdoors', 'Kitchen', 'Room Decor', 'Other'];

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.description.trim()) {
            Alert.alert('Error', 'Please fill in title and description');
            return;
        }

        setLoading(true);
        try {
            const requestData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                urgent: formData.urgent,
                budget_min: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
                budget_max: formData.budgetMax ? parseFloat(formData.budgetMax) : null
            };

            await createRequest(requestData);
            onAddRequest();
        } catch (error) {
            console.error('Error creating request:', error);
            Alert.alert('Error', 'Failed to post request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.formHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.formHeaderTitle}>Post a Request</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.formContent} contentContainerStyle={styles.formScrollContent}>
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>What are you looking for?</Text>
                    <TextInput
                        style={styles.formInput}
                        placeholder="e.g., ISO: Mini Fridge under $70"
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                    />
                </View>

                <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.formLabel}>Category</Text>
                        <View style={styles.picker}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryChip,
                                            formData.category === cat && styles.categoryChipActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, category: cat })}
                                    >
                                        <Text style={[
                                            styles.categoryChipText,
                                            formData.category === cat && styles.categoryChipTextActive
                                        ]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Urgency</Text>
                    <TouchableOpacity
                        style={[styles.urgentToggle, formData.urgent && styles.urgentToggleActive]}
                        onPress={() => setFormData({ ...formData, urgent: !formData.urgent })}
                    >
                        <Text style={[styles.urgentToggleText, formData.urgent && styles.urgentToggleTextActive]}>
                            🔥 {formData.urgent ? 'Urgent' : 'Not Urgent'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Budget (CAD)</Text>
                    <View style={styles.budgetRow}>
                        <TextInput
                            style={[styles.formInput, { flex: 1 }]}
                            placeholder="Min"
                            keyboardType="numeric"
                            value={formData.budgetMin}
                            onChangeText={(text) => setFormData({ ...formData, budgetMin: text })}
                        />
                        <Text style={styles.budgetDash}>—</Text>
                        <TextInput
                            style={[styles.formInput, { flex: 1 }]}
                            placeholder="Max"
                            keyboardType="numeric"
                            value={formData.budgetMax}
                            onChangeText={(text) => setFormData({ ...formData, budgetMax: text })}
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                        style={[styles.formInput, styles.formTextArea]}
                        placeholder="Describe what you're looking for..."
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Posting...' : 'Post Request'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 12,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    postButton: {
        backgroundColor: COLORS.green,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
    },
    filtersContainer: {
        marginBottom: 8,
    },
    filtersContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: COLORS.green,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
    },
    listContent: {
        paddingBottom: 16,
    },
    requestItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    requestHeader: {
        flexDirection: 'row',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    requestContent: {
        flex: 1,
    },
    badges: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    urgentBadge: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    urgentBadgeText: {
        color: '#991b1b',
        fontSize: 11,
        fontWeight: '600',
    },
    categoryBadge: {
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryBadgeText: {
        color: '#666',
        fontSize: 11,
    },
    requestTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    requestDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    requestMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: '#999',
    },
    // Detail Screen
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
    },
    detailHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
        flex: 1,
        textAlign: 'center',
    },
    deleteButton: {
        padding: 4,
    },
    detailContent: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    requestCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
    },
    requestCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.dark,
    },
    authorUniversity: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    requestTime: {
        fontSize: 12,
        color: '#999',
    },
    requestCardBadges: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    budgetBadge: {
        backgroundColor: '#d1fae5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    budgetBadgeText: {
        color: '#065f46',
        fontSize: 11,
        fontWeight: '600',
    },
    requestCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 8,
    },
    requestCardDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    repliesSection: {
        padding: 16,
    },
    repliesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 12,
    },
    noReplies: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    noRepliesText: {
        fontSize: 14,
        color: '#666',
    },
    replyItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    replyAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
    },
    replyAvatarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    replyAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
    },
    replyTime: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    opBadge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    opBadgeText: {
        color: '#1e40af',
        fontSize: 10,
        fontWeight: '600',
    },
    replyText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    replyActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    replyActionText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    replyNestLine: {
        position: 'absolute',
        left: -8,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: '#e0e0e0',
        borderRadius: 1,
    },
    nestedReplies: {
        marginTop: 8,
    },
    replyInputContainer: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    replyingToBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
    },
    replyingToText: {
        fontSize: 12,
        color: COLORS.green,
        fontWeight: '500',
    },
    replyInput: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
        gap: 12,
    },
    replyTextInput: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    // Form
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    formHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
    },
    formContent: {
        flex: 1,
    },
    formScrollContent: {
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
    },
    formTextArea: {
        minHeight: 100,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    picker: {
        marginTop: 8,
    },
    categoryChip: {
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: COLORS.green,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    urgentToggle: {
        backgroundColor: COLORS.lightGray,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    urgentToggleActive: {
        backgroundColor: '#fee2e2',
        borderColor: '#991b1b',
    },
    urgentToggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    urgentToggleTextActive: {
        color: '#991b1b',
    },
    budgetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    budgetDash: {
        fontSize: 16,
        color: '#999',
    },
    submitButton: {
        backgroundColor: COLORS.green,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
