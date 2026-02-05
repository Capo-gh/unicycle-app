import { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck, MessageCircle, Send, ArrowLeft, Trash2 } from 'lucide-react';
import { getConversations, getConversation, sendMessage, createConversation, archiveConversation } from '../api/messages';

export default function Messages({ incomingRequest, user }) {
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, []);

    // Handle incoming request from ItemDetail (Contact Seller)
    useEffect(() => {
        if (incomingRequest?.listingId && incomingRequest?.initialMessage !== undefined) {
            handleStartConversation(incomingRequest.listingId, incomingRequest.initialMessage || "Hi, is this still available?");
        }
    }, [incomingRequest]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    const fetchConversations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = async (convId) => {
        setSelectedConvId(convId);
        try {
            const data = await getConversation(convId);
            setActiveConversation(data);

            // Update unread count in list
            setConversations(prev => prev.map(c =>
                c.id === convId ? { ...c, unread_count: 0 } : c
            ));
        } catch (err) {
            console.error('Error fetching conversation:', err);
        }
    };

    const handleStartConversation = async (listingId, initialMessage) => {
        try {
            const conv = await createConversation(listingId, initialMessage);
            // Refresh conversations list
            await fetchConversations();
            // Select the new/existing conversation
            handleSelectConversation(conv.id);
        } catch (err) {
            console.error('Error starting conversation:', err);
            alert('Failed to start conversation');
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConvId || sending) return;

        setSending(true);
        try {
            const newMessage = await sendMessage(selectedConvId, messageText.trim());

            // Add message to active conversation
            setActiveConversation(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage]
            }));

            // Update last message in conversations list
            setConversations(prev => prev.map(c =>
                c.id === selectedConvId
                    ? { ...c, last_message: newMessage, updated_at: newMessage.created_at }
                    : c
            ));

            setMessageText('');
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message');
        } finally {
            setSending(false);
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

    // Get the other person in the conversation
    const getOtherPerson = (conv) => {
        if (!conv || !user) return null;
        return conv.buyer_id === user.id ? conv.seller : conv.buyer;
    };

    // Format time ago
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

    return (
        <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">

            {/* ─── LEFT: Conversation List ─── */}
            <div className={`w-full lg:w-96 bg-white flex flex-col border-r border-gray-200 ${selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
                {/* Header */}
                <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-900 mb-3">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {/* Error State */}
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

                {/* Empty State */}
                {!loading && !error && conversations.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                        <p className="text-gray-500 text-sm">Start by contacting a seller on an item you're interested in!</p>
                    </div>
                )}

                {/* Conversations List */}
                {!loading && !error && conversations.length > 0 && (
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map(conv => {
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

                {/* Safety Tips (mobile only when no chat selected) */}
                {!selectedConvId && !loading && (
                    <div className="lg:hidden p-4 flex-shrink-0">
                        <div className="bg-gradient-to-r from-unicycle-green/10 to-unicycle-blue/10 rounded-lg p-4 border border-unicycle-green/30">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">🛡️ Safety Tips</h4>
                            <ul className="text-xs text-gray-700 space-y-1">
                                <li>• Always meet at campus Safe Zones</li>
                                <li>• Verify items before completing payment</li>
                                <li>• Use Secure-Pay for items over $50</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── RIGHT: Chat Interface ─── */}
            <div className={`flex-1 flex flex-col bg-white ${selectedConvId ? 'flex' : 'hidden lg:flex'}`}>
                {activeConversation ? (
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
                                <p className="text-xs text-gray-500">
                                    Re: {activeConversation.listing?.title || 'Item'} • ${activeConversation.listing?.price || 0}
                                </p>
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
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${isMe
                                                ? 'bg-gradient-to-br from-unicycle-green to-unicycle-blue'
                                                : 'bg-gradient-to-br from-unicycle-blue to-unicycle-green'
                                                }`}>
                                                {msg.sender?.name?.charAt(0) || '?'}
                                            </div>

                                            {/* Message Bubble */}
                                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe
                                                ? 'bg-unicycle-green text-white rounded-tr-sm'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                                                }`}>
                                                <p>{msg.text}</p>
                                                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/80' : 'text-gray-400'}`}>
                                                    {formatTimeAgo(msg.created_at)}
                                                </p>
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
                                    onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                                    placeholder="Type a message..."
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