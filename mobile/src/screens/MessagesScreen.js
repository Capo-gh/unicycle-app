import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../../../shared/constants/colors';
import { getConversations, getConversation, sendMessage, createConversation, archiveConversation, unarchiveConversation, hideMessage } from '../api/messages';
import { API_BASE_URL } from '../../../shared/config/api';

export default function MessagesScreen({ route }) {
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [newConvRequest, setNewConvRequest] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // { id, text, senderName }
    const [translatedMessages, setTranslatedMessages] = useState({});
    const [translatingId, setTranslatingId] = useState(null);
    const { user } = useAuth();
    const { i18n } = useTranslation();
    const userLang = i18n.language || 'en';
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [convReadByOther, setConvReadByOther] = useState(new Set());
    const typingTimeoutRef = useRef(null);
    const sendTypingTimeoutRef = useRef(null);
    const flatListRef = useRef(null);
    const wsRef = useRef(null);

    const translateMessage = useCallback(async (msgId, text) => {
        if (translatedMessages[msgId]) {
            // Toggle back to original
            setTranslatedMessages(prev => { const next = { ...prev }; delete next[msgId]; return next; });
            return;
        }
        setTranslatingId(msgId);
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${userLang}`);
            const data = await res.json();
            const translated = data.responseData?.translatedText;
            if (translated && translated !== text) {
                setTranslatedMessages(prev => ({ ...prev, [msgId]: translated }));
            }
        } catch {}
        setTranslatingId(null);
    }, [translatedMessages]);

    useEffect(() => {
        fetchConversations();
    }, [showArchived]);

    // Handle incoming route params (from "Message Seller" on item detail)
    useEffect(() => {
        if (!route?.params?.listingId || loading) return;
        const { listingId, listingTitle, listingPrice, initialMessage } = route.params;
        const existing = conversations.find(c => c.listing?.id === listingId);
        if (existing) {
            handleSelectConversation(existing.id);
        } else {
            setNewConvRequest({ listingId, listingTitle, listingPrice, initialMessage });
            setSelectedConvId('new');
        }
    }, [route?.params?.listingId, loading]);

    useEffect(() => {
        if (activeConversation?.messages) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [activeConversation?.messages]);

    // WebSocket for real-time messages
    useEffect(() => {
        if (!selectedConvId || selectedConvId === 'new') {
            wsRef.current?.close();
            wsRef.current = null;
            return;
        }

        let shouldReconnect = true;
        let reconnectDelay = 1000;
        let timeoutId = null;

        const connect = async () => {
            if (!shouldReconnect) return;
            const wsBase = API_BASE_URL.replace(/^http/, 'ws');
            const ws = new WebSocket(`${wsBase}/ws/conversations/${selectedConvId}`);
            wsRef.current = ws;

            ws.onopen = async () => {
                reconnectDelay = 1000;
                const token = await AsyncStorage.getItem('token');
                ws.send(JSON.stringify({ type: 'auth', token }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'new_message') {
                        setActiveConversation(prev => {
                            if (!prev || prev.messages.some(m => m.id === data.message.id)) return prev;
                            return { ...prev, messages: [...prev.messages, data.message] };
                        });
                        setConversations(prev => prev.map(c =>
                            c.id === data.conversation_id
                                ? { ...c, last_message: data.message, updated_at: data.message.created_at }
                                : c
                        ));
                    } else if (data.type === 'typing') {
                        setIsOtherTyping(true);
                        clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000);
                    } else if (data.type === 'messages_read') {
                        setConvReadByOther(prev => new Set([...prev, data.conversation_id]));
                    }
                } catch {}
            };

            ws.onclose = (event) => {
                if (event.code === 4001) {
                    shouldReconnect = false;
                    return;
                }
                if (shouldReconnect) {
                    timeoutId = setTimeout(() => {
                        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
                        connect();
                    }, reconnectDelay);
                }
            };
        };

        connect();

        return () => {
            shouldReconnect = false;
            if (timeoutId) clearTimeout(timeoutId);
            wsRef.current?.close();
            wsRef.current = null;
        };
    }, [selectedConvId]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const data = await getConversations({ includeArchived: showArchived });
            setConversations(data);
            setFilteredConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            Alert.alert('Error', 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = conversations.filter(conv => {
                const otherPerson = getOtherPerson(conv);
                const listing = conv.listing?.title || '';
                const name = otherPerson?.name || '';
                const query = searchQuery.toLowerCase();
                return name.toLowerCase().includes(query) || listing.toLowerCase().includes(query);
            });
            setFilteredConversations(filtered);
        } else {
            setFilteredConversations(conversations);
        }
    }, [searchQuery, conversations]);

    const sendTypingEvent = () => {
        if (!wsRef.current || wsRef.current.readyState !== 1) return; // 1 = OPEN
        if (sendTypingTimeoutRef.current) return;
        wsRef.current.send(JSON.stringify({ type: 'typing' }));
        sendTypingTimeoutRef.current = setTimeout(() => { sendTypingTimeoutRef.current = null; }, 3000);
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

    const handleSendMessage = async (quickText) => {
        const text = quickText || messageText.trim();
        if (!text || sending || !selectedConvId) return;

        setSending(true);
        try {
            if (selectedConvId === 'new' && newConvRequest?.listingId) {
                const conv = await createConversation(newConvRequest.listingId, text);
                setNewConvRequest(null);
                setMessageText('');
                await fetchConversations();
                handleSelectConversation(conv.id);
            } else {
                const newMessage = await sendMessage(selectedConvId, text, replyingTo?.id || null);
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
                setReplyingTo(null);
            }
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

    const handleUnarchive = async (convId) => {
        try {
            await unarchiveConversation(convId);
            setConversations(prev => prev.filter(c => c.id !== convId));
            if (selectedConvId === convId) {
                setSelectedConvId(null);
                setActiveConversation(null);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to restore conversation');
        }
    };

    const handleHideMessage = (msgId) => {
        Alert.alert(
            'Delete for me',
            'This message will be hidden from your view only.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await hideMessage(selectedConvId, msgId);
                            setActiveConversation(prev => ({
                                ...prev,
                                messages: prev.messages.filter(m => m.id !== msgId)
                            }));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete message');
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

    if (selectedConvId === 'new' && newConvRequest) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={styles.chatHeader}>
                        <TouchableOpacity
                            onPress={() => { setSelectedConvId(null); setNewConvRequest(null); }}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                        </TouchableOpacity>
                        <View style={styles.chatHeaderContent}>
                            <View style={styles.chatAvatar}>
                                <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.chatHeaderName}>New Conversation</Text>
                                <Text style={styles.chatHeaderListing} numberOfLines={1}>
                                    {newConvRequest.listingTitle || 'Item'}
                                    {newConvRequest.listingPrice ? ` • $${newConvRequest.listingPrice}` : ''}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <FlatList
                        data={[]}
                        keyExtractor={() => ''}
                        contentContainerStyle={styles.messagesContainer}
                        ListEmptyComponent={(
                            <View style={styles.quickRepliesContainer}>
                                <Text style={styles.quickRepliesLabel}>Quick replies:</Text>
                                {[
                                    "Hi, is this still available?",
                                    "Hi! I'm interested. Can we meet on campus?",
                                    "Hello! What condition is this in?",
                                    "Hi! Is the price negotiable?",
                                    "Hi! When would you be available to meet?",
                                ].map((suggestion, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.quickReplyButton}
                                        onPress={() => handleSendMessage(suggestion)}
                                        disabled={sending}
                                    >
                                        <Text style={styles.quickReplyText}>{suggestion}</Text>
                                    </TouchableOpacity>
                                ))}
                                <Text style={styles.quickRepliesOr}>Or type your own message below</Text>
                            </View>
                        )}
                        renderItem={() => null}
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
                            style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
                            onPress={() => handleSendMessage()}
                            disabled={!messageText.trim() || sending}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

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
                                {otherPerson?.avatar_url
                                    ? <Image source={{ uri: otherPerson.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                                    : <Text style={styles.chatAvatarText}>{otherPerson?.name?.charAt(0) || '?'}</Text>
                                }
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.chatHeaderName}>{otherPerson?.name || 'Unknown'}</Text>
                                <View style={styles.chatHeaderSubRow}>
                                    <Text style={styles.chatHeaderListing} numberOfLines={1}>
                                        {activeConversation.listing?.title || 'Item'} • ${activeConversation.listing?.price || 0}
                                    </Text>
                                    {activeConversation.listing?.price >= 80 && (
                                        <View style={styles.securePayBadge}>
                                            <Ionicons name="shield-checkmark" size={10} color={COLORS.green} />
                                            <Text style={styles.securePayBadgeText}>Secure-Pay</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                        {showArchived ? (
                            <TouchableOpacity
                                onPress={() => handleUnarchive(selectedConvId)}
                                style={styles.archiveButton}
                            >
                                <Ionicons name="arrow-undo-outline" size={22} color={COLORS.green} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => handleArchive(selectedConvId)}
                                style={styles.archiveButton}
                            >
                                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={activeConversation.messages || []}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.messagesContainer}
                        ListEmptyComponent={(
                            <View style={styles.quickRepliesContainer}>
                                <Text style={styles.quickRepliesLabel}>Quick replies:</Text>
                                {[
                                    "Hi, is this still available?",
                                    "Hi! I'm interested. Can we meet on campus?",
                                    "Hello! What condition is this in?",
                                    "Hi! Is the price negotiable?",
                                    "Hi! When would you be available to meet?",
                                ].map((suggestion, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.quickReplyButton}
                                        onPress={() => handleSendMessage(suggestion)}
                                        disabled={sending}
                                    >
                                        <Text style={styles.quickReplyText}>{suggestion}</Text>
                                    </TouchableOpacity>
                                ))}
                                <Text style={styles.quickRepliesOr}>Or type your own message below</Text>
                            </View>
                        )}
                        renderItem={({ item }) => {
                            const isMe = item.sender_id === user?.id;

                            const renderReplyAction = () => (
                                <TouchableOpacity
                                    style={styles.swipeReplyAction}
                                    onPress={() => setReplyingTo({ id: item.id, text: item.text, senderName: item.sender?.name || 'Unknown' })}
                                >
                                    <Ionicons name="return-down-back-outline" size={20} color="#fff" />
                                </TouchableOpacity>
                            );

                            const renderDeleteAction = () => (
                                <TouchableOpacity
                                    style={styles.swipeDeleteAction}
                                    onPress={() => handleHideMessage(item.id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#fff" />
                                </TouchableOpacity>
                            );

                            return (
                                <Swipeable
                                    renderLeftActions={renderReplyAction}
                                    renderRightActions={renderDeleteAction}
                                    overshootLeft={false}
                                    overshootRight={false}
                                >
                                <View style={[
                                    styles.messageRow,
                                    isMe ? styles.myMessageRow : styles.theirMessageRow
                                ]}>
                                    {!isMe && (
                                        <View style={styles.msgAvatar}>
                                            {otherPerson?.avatar_url
                                                ? <Image source={{ uri: otherPerson.avatar_url }} style={{ width: 28, height: 28, borderRadius: 14 }} />
                                                : <Text style={styles.msgAvatarText}>{otherPerson?.name?.charAt(0) || '?'}</Text>
                                            }
                                        </View>
                                    )}
                                    <View style={{ maxWidth: '78%', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                        {item.reply_to && (
                                            <TouchableOpacity
                                                style={[styles.replyPreview, isMe ? styles.replyPreviewMe : styles.replyPreviewThem]}
                                                onPress={() => {
                                                    const idx = activeConversation?.messages?.findIndex(m => m.id === item.reply_to.id);
                                                    if (idx !== undefined && idx >= 0) {
                                                        flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
                                                    }
                                                }}
                                            >
                                                <Text style={styles.replyPreviewName}>{item.reply_to.sender?.name}</Text>
                                                <Text style={styles.replyPreviewText} numberOfLines={1}>{item.reply_to.text || (item.reply_to.image_url ? '📷 Photo' : '')}</Text>
                                            </TouchableOpacity>
                                        )}
                                        <View style={[
                                            styles.messageBubble,
                                            isMe ? styles.myMessage : styles.theirMessage
                                        ]}>
                                            <Text style={[
                                                styles.messageText,
                                                isMe ? styles.myMessageText : styles.theirMessageText
                                            ]}>
                                                {translatedMessages[item.id] || item.text}
                                            </Text>
                                            {item.image_url && (
                                                <Image
                                                    source={{ uri: item.image_url }}
                                                    style={{ width: 200, height: 150, borderRadius: 8, marginTop: 4 }}
                                                    resizeMode="cover"
                                                />
                                            )}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                                <Text style={[
                                                    styles.messageTime,
                                                    isMe ? styles.myMessageTime : styles.theirMessageTime
                                                ]}>
                                                    {formatTimeAgo(item.created_at)}
                                                </Text>
                                                {isMe && item.id === activeConversation?.messages[activeConversation.messages.length - 1]?.id && (
                                                    <Text style={{ fontSize: 9, color: convReadByOther.has(selectedConvId) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}>
                                                        {convReadByOther.has(selectedConvId) ? '✓✓' : '✓'}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        {!isMe && (
                                            <TouchableOpacity
                                                onPress={() => translateMessage(item.id, item.text)}
                                                style={styles.translateBtn}
                                            >
                                                <Ionicons name="language-outline" size={11} color="#9ca3af" />
                                                <Text style={styles.translateBtnText}>
                                                    {translatingId === item.id ? '...' : translatedMessages[item.id] ? 'Show original' : 'Translate'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {isMe && (
                                        <View style={[styles.msgAvatar, styles.msgAvatarMe]}>
                                            {user?.avatar_url
                                                ? <Image source={{ uri: user.avatar_url }} style={{ width: 28, height: 28, borderRadius: 14 }} />
                                                : <Text style={styles.msgAvatarText}>{user?.name?.charAt(0) || '?'}</Text>
                                            }
                                        </View>
                                    )}
                                </View>
                                </Swipeable>
                            );
                        }}
                        ListFooterComponent={() => isOtherTyping ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, gap: 8 }}>
                                <View style={[styles.msgAvatar, { backgroundColor: '#22c55e' }]}>
                                    <Text style={styles.msgAvatarText}>{getOtherPerson(activeConversation)?.name?.charAt(0) || '?'}</Text>
                                </View>
                                <View style={[styles.messageBubble, styles.theirMessage, { paddingVertical: 8, paddingHorizontal: 14 }]}>
                                    <Text style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 13 }}>typing...</Text>
                                </View>
                            </View>
                        ) : null}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />

                    {replyingTo && (
                        <View style={styles.replyBanner}>
                            <Ionicons name="return-down-back-outline" size={14} color={COLORS.green} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.replyBannerName}>{replyingTo.senderName}</Text>
                                <Text style={styles.replyBannerText} numberOfLines={1}>{replyingTo.text}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                <Ionicons name="close" size={16} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.messageInput}>
                        <TextInput
                            style={styles.messageTextInput}
                            placeholder={replyingTo ? `Reply to ${replyingTo.senderName}...` : 'Type a message...'}
                            value={messageText}
                            onChangeText={(text) => { setMessageText(text); sendTypingEvent(); }}
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

        const renderArchiveAction = () => (
            <TouchableOpacity
                style={styles.swipeArchiveAction}
                onPress={() => showArchived ? handleUnarchive(item.id) : handleArchive(item.id)}
            >
                <Ionicons name={showArchived ? 'arrow-undo-outline' : 'archive-outline'} size={22} color="#fff" />
                <Text style={styles.swipeActionText}>{showArchived ? 'Restore' : 'Archive'}</Text>
            </TouchableOpacity>
        );

        return (
            <Swipeable renderRightActions={renderArchiveAction} overshootRight={false}>
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handleSelectConversation(item.id)}
            >
                <View style={styles.conversationAvatar}>
                    {otherPerson?.avatar_url
                        ? <Image source={{ uri: otherPerson.avatar_url }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                        : <Text style={styles.conversationAvatarText}>{otherPerson?.name?.charAt(0) || '?'}</Text>
                    }
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
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <TouchableOpacity
                        onPress={() => { setShowArchived(v => !v); setSelectedConvId(null); setActiveConversation(null); }}
                        style={[styles.archivedToggle, showArchived && styles.archivedToggleActive]}
                    >
                        <Ionicons name={showArchived ? 'arrow-undo-outline' : 'archive-outline'} size={14} color={showArchived ? '#fff' : '#666'} />
                        <Text style={[styles.archivedToggleText, showArchived && styles.archivedToggleTextActive]}>
                            {showArchived ? 'Inbox' : 'Archived'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
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
                    data={filteredConversations}
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
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.green,
    },
    archivedToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    archivedToggleActive: {
        backgroundColor: COLORS.green,
    },
    archivedToggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    archivedToggleTextActive: {
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 15,
    },
    clearButton: {
        padding: 4,
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
    quickRepliesContainer: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 8,
        justifyContent: 'center',
    },
    quickRepliesLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    quickReplyButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 8,
    },
    quickReplyText: {
        fontSize: 14,
        color: '#374151',
    },
    quickRepliesOr: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 8,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    theirMessageRow: {
        justifyContent: 'flex-start',
    },
    msgAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#9ca3af',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    msgAvatarMe: {
        backgroundColor: COLORS.green,
        marginRight: 0,
        marginLeft: 8,
    },
    msgAvatarText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
    },
    myMessage: {
        backgroundColor: COLORS.green,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
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
    translateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
        marginLeft: 4,
    },
    translateBtnText: {
        fontSize: 11,
        color: '#9ca3af',
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
    chatHeaderSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    securePayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(76,175,80,0.1)',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    securePayBadgeText: {
        fontSize: 9,
        fontWeight: '600',
        color: COLORS.green,
    },
    // Swipe actions
    swipeArchiveAction: {
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        paddingHorizontal: 8,
        gap: 4,
    },
    swipeReplyAction: {
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: 'center',
        width: 56,
        marginBottom: 8,
        borderRadius: 8,
    },
    swipeDeleteAction: {
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 56,
        marginBottom: 8,
        borderRadius: 8,
    },
    swipeActionText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    // Reply preview inside bubble
    replyPreview: {
        borderLeftWidth: 3,
        paddingLeft: 8,
        paddingVertical: 4,
        paddingRight: 8,
        marginBottom: 4,
        borderRadius: 4,
        maxWidth: '100%',
    },
    replyPreviewMe: {
        borderLeftColor: 'rgba(255,255,255,0.6)',
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    replyPreviewThem: {
        borderLeftColor: '#9ca3af',
        backgroundColor: '#f3f4f6',
    },
    replyPreviewName: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.green,
        marginBottom: 1,
    },
    replyPreviewText: {
        fontSize: 11,
        color: '#6b7280',
    },
    // Reply banner above input
    replyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f9fafb',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    replyBannerName: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.green,
    },
    replyBannerText: {
        fontSize: 11,
        color: '#6b7280',
    },
});
