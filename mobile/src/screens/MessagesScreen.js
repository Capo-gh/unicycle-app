import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { getConversations, getConversation, sendMessage, archiveConversation } from '../api/messages';

export default function MessagesScreen() {
    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { user } = useAuth();
    const flatListRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConversation?.messages) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [activeConversation?.messages]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            Alert.alert('Error', 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = async (convId) => {
        setSelectedConvId(convId);
        try {
            const data = await getConversation(convId);
            setActiveConversation(data);
            setConversations(prev => prev.map(c =>
                c.id === convId ? { ...c, unread_count: 0 } : c
            ));
        } catch (error) {
            console.error('Error fetching conversation:', error);
            Alert.alert('Error', 'Failed to load conversation');
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || sending || !selectedConvId) return;

        setSending(true);
        try {
            const newMessage = await sendMessage(selectedConvId, messageText.trim());
            setActiveConversation(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage]
            }));
            setConversations(prev => prev.map(c =>
                c.id === selectedConvId
                    ? { ...c, last_message: newMessage, updated_at: newMessage.created_at }
                    : c
            ));
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleArchive = (convId) => {
        Alert.alert(
            'Archive Conversation',
            'Are you sure you want to archive this conversation?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Archive',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await archiveConversation(convId);
                            setConversations(prev => prev.filter(c => c.id !== convId));
                            if (selectedConvId === convId) {
                                setSelectedConvId(null);
                                setActiveConversation(null);
                            }
                        } catch (error) {
                            console.error('Error archiving conversation:', error);
                            Alert.alert('Error', 'Failed to archive conversation');
                        }
                    }
                }
            ]
        );
    };

    const getOtherPerson = (conv) => {
        if (!conv || !user?.id) return null;
        return conv.buyer_id === user.id ? conv.seller : conv.buyer;
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (selectedConvId && activeConversation) {
        const otherPerson = getOtherPerson(activeConversation);

        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={styles.chatHeader}>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedConvId(null);
                                setActiveConversation(null);
                            }}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                        </TouchableOpacity>
                        <View style={styles.chatHeaderContent}>
                            <View style={styles.chatAvatar}>
                                <Text style={styles.chatAvatarText}>
                                    {otherPerson?.name?.charAt(0) || '?'}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.chatHeaderName}>{otherPerson?.name || 'Unknown'}</Text>
                                <Text style={styles.chatHeaderListing} numberOfLines={1}>
                                    {activeConversation.listing?.title || 'Item'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleArchive(selectedConvId)}
                            style={styles.archiveButton}
                        >
                            <Ionicons name="trash-outline" size={22} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={activeConversation.messages || []}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.messagesContainer}
                        renderItem={({ item }) => {
                            const isMe = item.sender_id === user?.id;
                            return (
                                <View style={[
                                    styles.messageBubble,
                                    isMe ? styles.myMessage : styles.theirMessage
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        isMe ? styles.myMessageText : styles.theirMessageText
                                    ]}>
                                        {item.text}
                                    </Text>
                                    <Text style={[
                                        styles.messageTime,
                                        isMe ? styles.myMessageTime : styles.theirMessageTime
                                    ]}>
                                        {formatTimeAgo(item.created_at)}
                                    </Text>
                                </View>
                            );
                        }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />

                    <View style={styles.messageInput}>
                        <TextInput
                            style={styles.messageTextInput}
                            placeholder="Type a message..."
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                            onPress={handleSendMessage}
                            disabled={!messageText.trim() || sending}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    const renderConversationItem = ({ item }) => {
        const otherPerson = getOtherPerson(item);
        const hasUnread = item.unread_count > 0;

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handleSelectConversation(item.id)}
            >
                <View style={styles.conversationAvatar}>
                    <Text style={styles.conversationAvatarText}>
                        {otherPerson?.name?.charAt(0) || '?'}
                    </Text>
                </View>
                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <Text style={[styles.conversationName, hasUnread && styles.unreadText]}>
                            {otherPerson?.name || 'Unknown'}
                        </Text>
                        <Text style={styles.conversationTime}>
                            {formatTimeAgo(item.updated_at)}
                        </Text>
                    </View>
                    <Text style={styles.conversationListing} numberOfLines={1}>
                        {item.listing?.title || 'Item'}
                    </Text>
                    <Text style={[
                        styles.conversationLastMessage,
                        hasUnread && styles.unreadText
                    ]} numberOfLines={1}>
                        {item.last_message?.text || 'No messages yet'}
                    </Text>
                </View>
                {hasUnread && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyEmoji}>💬</Text>
                    <Text style={styles.emptyTitle}>No messages yet</Text>
                    <Text style={styles.emptySubtitle}>Start a conversation with a buyer or seller</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversationItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
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
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 16,
    },
    conversationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    conversationAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    conversationAvatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
    },
    conversationTime: {
        fontSize: 12,
        color: '#999',
    },
    conversationListing: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    conversationLastMessage: {
        fontSize: 14,
        color: '#999',
    },
    unreadText: {
        fontWeight: '700',
        color: COLORS.dark,
    },
    unreadBadge: {
        backgroundColor: COLORS.green,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Chat View
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    chatHeaderContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    chatAvatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    chatHeaderName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
    },
    chatHeaderListing: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    archiveButton: {
        padding: 8,
    },
    messagesContainer: {
        padding: 16,
        flexGrow: 1,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.green,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.lightGray,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: COLORS.dark,
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
    },
    myMessageTime: {
        color: '#fff',
        opacity: 0.8,
    },
    theirMessageTime: {
        color: '#999',
    },
    messageInput: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
        gap: 12,
    },
    messageTextInput: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
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
});
