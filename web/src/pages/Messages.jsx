import { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck, MessageCircle, Send, ArrowLeft, Trash2, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getConversations, getConversation, sendMessage, createConversation, archiveConversation } from '../api/messages';

async function translateText(text, targetLang) {
    const sourceLang = targetLang === 'fr' ? 'en' : 'fr';
    const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    );
    const data = await res.json();
    return data.responseData?.translatedText || text;
}

export default function Messages({ incomingRequest, user }) {
    const { t, i18n } = useTranslation();
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [newConversationRequest, setNewConversationRequest] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [translatedMessages, setTranslatedMessages] = useState({});
    const [translatingId, setTranslatingId] = useState(null);
    const messagesEndRef = useRef(null);

    const currentUserId = user?.id;
    const userLang = i18n.language || 'en';

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (incomingRequest?.listingId) {
            setNewConversationRequest(incomingRequest);
            setSelectedConvId('new');
            setActiveConversation(null);
        }
    }, [incomingRequest]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    // Poll active conversation for new messages every 5 seconds
    useEffect(() => {
        if (!selectedConvId || selectedConvId === 'new') return;
        const interval = setInterval(async () => {
            try {
                const data = await getConversation(selectedConvId);
                setActiveConversation(data);
            } catch (err) {}
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedConvId]);

    const fetchConversations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError(t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = async (convId) => {
        setSelectedConvId(convId);
        setTranslatedMessages({});
        try {
            const data = await getConversation(convId);
            setActiveConversation(data);
            setConversations(prev => prev.map(c =>
                c.id === convId ? { ...c, unread_count: 0 } : c
            ));
        } catch (err) {
            console.error('Error fetching conversation:', err);
        }
    };

    const handleSendMessage = async (messageToSend = null) => {
        const textToSend = messageToSend || messageText.trim();
        if (!textToSend || sending) return;

        setSending(true);
        try {
            if (selectedConvId === 'new' && newConversationRequest?.listingId) {
                const conv = await createConversation(newConversationRequest.listingId, textToSend);
                await fetchConversations();
                setNewConversationRequest(null);
                setMessageText('');
                handleSelectConversation(conv.id);
            } else if (selectedConvId && selectedConvId !== 'new') {
                const newMessage = await sendMessage(selectedConvId, textToSend);
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
            }
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleTranslate = async (msg) => {
        const existing = translatedMessages[msg.id];
        // Toggle: if already translated and showing, revert to original
        if (existing?.showing) {
            setTranslatedMessages(prev => ({ ...prev, [msg.id]: { ...prev[msg.id], showing: false } }));
            return;
        }
        // If already fetched but hidden, just show again
        if (existing?.text) {
            setTranslatedMessages(prev => ({ ...prev, [msg.id]: { ...prev[msg.id], showing: true } }));
            return;
        }
        // Fetch translation
        setTranslatingId(msg.id);
        try {
            const translated = await translateText(msg.text, userLang);
            setTranslatedMessages(prev => ({ ...prev, [msg.id]: { text: translated, showing: true } }));
        } catch {
            // silently fail
        } finally {
            setTranslatingId(null);
        }
    };

    const handleArchiveConversation = async (convId) => {
        if (!confirm('Archive this conversation?')) return;
        try {
            await archiveConversation(convId);
            setConversations(prev => prev.filter(c => c.id !== convId));
            if (selectedConvId === convId) {
                setSelectedConvId(null);
                setActiveConversation(null);
            }
        } catch (err) {
            console.error('Error archiving conversation:', err);
        }
    };

    const getOtherPerson = (conv) => {
        if (!conv || !currentUserId) return null;
        return conv.buyer_id === currentUserId ? conv.seller : conv.buyer;
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const translateLabel = t('messages.translate');

    return (
        <div className="h-[calc(100vh-8.5rem)] lg:h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">

            {/* LEFT: Conversation List */}
            <div className={`w-full lg:w-96 bg-white flex flex-col border-r border-gray-200 ${selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
                <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-xl font-bold text-unicycle-green mb-3">{t('messages.title')}</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {error && !loading && (
                    <div className="p-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-600 text-sm">{error}</p>
                            <button onClick={fetchConversations} className="mt-2 text-unicycle-blue text-sm hover:underline">
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && conversations.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('messages.noConversations')}</h3>
                        <p className="text-gray-500 text-sm">{t('messages.noConversationsSubtext')}</p>
                    </div>
                )}

                {!loading && !error && conversations.length > 0 && (
                    <div className="flex-1 overflow-y-auto">
                        {conversations.filter(conv => {
                            if (!searchQuery.trim()) return true;
                            const q = searchQuery.toLowerCase();
                            const otherPerson = getOtherPerson(conv);
                            return (otherPerson?.name || '').toLowerCase().includes(q) ||
                                   (conv.listing?.title || '').toLowerCase().includes(q);
                        }).map(conv => {
                            const otherPerson = getOtherPerson(conv);
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv.id)}
                                    className={`w-full text-left p-4 flex gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedConvId === conv.id ? 'bg-unicycle-green/10' : ''}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                            {otherPerson?.name?.charAt(0) || '?'}
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {conv.unread_count}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900 text-sm truncate">
                                                    {otherPerson?.name || 'Unknown'}
                                                </h3>
                                                <ShieldCheck className="w-4 h-4 text-unicycle-blue flex-shrink-0" />
                                            </div>
                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                {formatTimeAgo(conv.last_message?.created_at || conv.updated_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-1 truncate">
                                            Re: {conv.listing?.title || 'Item'} • ${conv.listing?.price || 0}
                                        </p>
                                        <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                            {conv.last_message?.text || 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* RIGHT: Chat Interface */}
            <div className={`flex-1 flex flex-col bg-white ${selectedConvId ? 'flex' : 'hidden lg:flex'}`}>
                {selectedConvId === 'new' && newConversationRequest ? (
                    <>
                        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setSelectedConvId(null);
                                    setNewConversationRequest(null);
                                }}
                                className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <MessageCircle className="w-10 h-10 text-unicycle-green" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">New Conversation</h3>
                                <p className="text-xs text-gray-500">
                                    Re: {newConversationRequest.listingTitle || 'Item'} • ${newConversationRequest.listingPrice || 0}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50 flex items-center justify-center py-6">
                            <div className="max-w-md w-full px-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick replies:</h3>
                                <div className="space-y-2">
                                    {[
                                        "Hi, is this still available?",
                                        "Hi! I'm interested in this item. Can we meet on campus?",
                                        "Hello! What condition is this in?",
                                        "Hi! Is the price negotiable?",
                                        "Hi! When would you be available to meet?"
                                    ].map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSendMessage(suggestion)}
                                            disabled={sending}
                                            className="w-full text-left px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-unicycle-green hover:bg-unicycle-green/5 transition-colors text-sm disabled:opacity-50"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-4 text-center">Or type your own message below</p>
                            </div>
                        </div>

                        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                            <div className="flex gap-2 items-end">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                                    placeholder={t('messages.typePlaceholder')}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none"
                                    disabled={sending}
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!messageText.trim() || sending}
                                    className="p-2.5 bg-unicycle-green text-white rounded-full hover:bg-unicycle-green/90 disabled:opacity-50 flex-shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setSelectedConvId(null);
                                    setActiveConversation(null);
                                }}
                                className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <div className="w-10 h-10 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold">
                                {getOtherPerson(activeConversation)?.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                    {getOtherPerson(activeConversation)?.name || 'Unknown'}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-500">
                                        Re: {activeConversation.listing?.title || 'Item'} • ${activeConversation.listing?.price || 0}
                                    </p>
                                    {activeConversation.listing?.price >= 80 && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-unicycle-blue bg-unicycle-blue/10 px-1.5 py-0.5 rounded">
                                            <ShieldCheck className="w-3 h-3" />
                                            Secure-Pay
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleArchiveConversation(activeConversation.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                title="Archive conversation"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {activeConversation.messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-400 text-sm">No messages yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Start the conversation below!</p>
                                </div>
                            ) : (
                                activeConversation.messages.map((msg) => {
                                    const isMe = msg.sender_id === currentUserId;
                                    const translation = translatedMessages[msg.id];
                                    const displayText = translation?.showing ? translation.text : msg.text;
                                    const isTranslating = translatingId === msg.id;

                                    return (
                                        <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${isMe
                                                ? 'bg-gradient-to-br from-unicycle-green to-unicycle-blue'
                                                : 'bg-gradient-to-br from-unicycle-blue to-unicycle-green'
                                                }`}>
                                                {msg.sender?.name?.charAt(0) || '?'}
                                            </div>

                                            {/* Message Bubble + translate button */}
                                            <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                                    ? 'bg-unicycle-green text-white rounded-tr-sm'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                                                    }`}>
                                                    <p>{displayText}</p>
                                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-white/80' : 'text-gray-400'}`}>
                                                        {formatTimeAgo(msg.created_at)}
                                                    </p>
                                                </div>
                                                {/* Translate button for incoming messages only */}
                                                {!isMe && (
                                                    <button
                                                        onClick={() => handleTranslate(msg)}
                                                        disabled={isTranslating}
                                                        className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 hover:text-unicycle-blue transition-colors disabled:opacity-50"
                                                    >
                                                        <Languages className="w-3 h-3" />
                                                        {isTranslating
                                                            ? t('messages.translating')
                                                            : translation?.showing
                                                                ? t('messages.showOriginal')
                                                                : translateLabel}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                            <div className="flex gap-2 items-end">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                                    placeholder={t('messages.typePlaceholder')}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none"
                                    disabled={sending}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim() || sending}
                                    className="p-2.5 bg-unicycle-green text-white rounded-full hover:bg-unicycle-green/90 disabled:opacity-50 flex-shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
                        <p className="text-gray-500 text-sm">Choose from the left to start chatting</p>
                    </div>
                )}
            </div>
        </div>

    );
}
