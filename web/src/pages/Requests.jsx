import { useState, useEffect } from 'react';
import { Search, Plus, MessageCircle, Clock, TrendingUp, ArrowLeft, DollarSign, Send, Trash2 } from 'lucide-react';
import { getAllRequests, getRequest, createRequest, createReply, deleteRequest, deleteReply } from '../api/requests';

export default function Requests({ user }) {
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPostForm, setShowPostForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const filters = ['All', 'Urgent', 'Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Sports & Outdoors', 'Kitchen', 'Room Decor', 'Other'];

    // Fetch requests from backend
    useEffect(() => {
        fetchRequests();
    }, [selectedFilter, searchQuery]);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters_obj = {
                category: selectedFilter !== 'All' ? selectedFilter : undefined,
                search: searchQuery || undefined
            };
            const data = await getAllRequests(filters_obj);
            setRequests(data);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    // Fetch single request with replies when selected
    const handleSelectRequest = async (requestId) => {
        try {
            const data = await getRequest(requestId);
            setSelectedRequest(data);
        } catch (err) {
            console.error('Error fetching request:', err);
        }
    };

    // Handle adding a new request
    const handleAddRequest = async (newRequest) => {
        // Refresh the list
        await fetchRequests();
        setShowPostForm(false);
    };

    // Handle adding a reply
    const handleAddReply = async (requestId, replyText) => {
        try {
            const newReply = await createReply(requestId, replyText);

            // Update the selected request with new reply
            setSelectedRequest(prev => ({
                ...prev,
                replies: [...prev.replies, newReply]
            }));

            // Update reply count in list
            setRequests(prev => prev.map(req => {
                if (req.id === requestId) {
                    return { ...req, reply_count: (req.reply_count || 0) + 1 };
                }
                return req;
            }));
        } catch (err) {
            console.error('Error adding reply:', err);
            alert('Failed to add reply. Please try again.');
        }
    };

    // Handle deleting a request
    const handleDeleteRequest = async (requestId) => {
        if (!confirm('Are you sure you want to delete this request?')) return;

        try {
            await deleteRequest(requestId);
            setRequests(prev => prev.filter(r => r.id !== requestId));
            setSelectedRequest(null);
        } catch (err) {
            console.error('Error deleting request:', err);
            alert('Failed to delete request');
        }
    };

    // Format time ago
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

    // ─── POST FORM ───
    if (showPostForm) {
        return <PostRequestForm
            user={user}
            onBack={() => setShowPostForm(false)}
            onAddRequest={handleAddRequest}
        />;
    }

    // ─── MAIN VIEW ───
    return (
        <div className="w-full min-h-screen lg:h-screen flex flex-col lg:flex-row pb-20 lg:pb-0 overflow-x-hidden">

            {/* ─── LEFT: Requests List ─── */}
            <div className={`${selectedRequest ? 'hidden lg:flex' : 'flex'} flex-col w-full min-w-0 lg:w-1/2 lg:border-r lg:border-gray-200 lg:overflow-y-auto`}>

                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="px-4 lg:px-6 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Requests</h1>
                                <p className="text-xs text-gray-500">Looking for something? Post it here!</p>
                            </div>
                            <button
                                onClick={() => setShowPostForm(true)}
                                className="bg-unicycle-green text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-unicycle-green/90 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Post Request</span>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setSelectedFilter(filter)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedFilter === filter
                                        ? 'bg-unicycle-green text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {filter === 'Urgent' && '🔥 '}{filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-unicycle-green"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="p-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-600">{error}</p>
                            <button onClick={fetchRequests} className="mt-2 text-sm text-unicycle-blue hover:underline">
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && requests.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
                        <p className="text-gray-600 mb-4">Be the first to post what you're looking for!</p>
                        <button
                            onClick={() => setShowPostForm(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-unicycle-green text-white rounded-lg hover:bg-unicycle-green/90"
                        >
                            <Plus className="w-4 h-4" />
                            Post a Request
                        </button>
                    </div>
                )}

                {/* Requests List */}
                {!loading && !error && requests.length > 0 && (
                    <div className="flex-1 overflow-y-auto">
                        {requests.map((request) => (
                            <button
                                key={request.id}
                                onClick={() => handleSelectRequest(request.id)}
                                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedRequest?.id === request.id ? 'bg-unicycle-green/10' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {request.author?.name?.charAt(0) || '?'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Tags */}
                                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                            {request.urgent && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                                    🔥 URGENT
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                {request.category}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                            {request.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                            {request.description}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>{request.author?.name}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeAgo(request.created_at)}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="w-3 h-3" />
                                                {request.reply_count || 0} replies
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── RIGHT: Request Detail ─── */}
            <div className={`${selectedRequest ? 'flex' : 'hidden lg:flex'} flex-col w-full lg:w-1/2 bg-gray-50 lg:overflow-hidden`}>
                {selectedRequest ? (
                    <RequestDetail
                        request={selectedRequest}
                        user={user}
                        onBack={() => setSelectedRequest(null)}
                        onAddReply={handleAddReply}
                        onDelete={handleDeleteRequest}
                        formatTimeAgo={formatTimeAgo}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Select a request</h3>
                        <p className="text-gray-500 text-sm">Choose from the list to see details and replies</p>
                    </div>
                )}
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════
// REQUEST DETAIL COMPONENT
// ═══════════════════════════════════════════════════════════════════
function RequestDetail({ request, user, onBack, onAddReply, onDelete, formatTimeAgo }) {
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    const handleSendReply = async () => {
        if (!replyText.trim()) return;

        setSending(true);
        try {
            await onAddReply(request.id, replyText.trim());
            setReplyText('');
        } finally {
            setSending(false);
        }
    };

    const isOwner = user?.id === request.author_id || user?.email === request.author?.email;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <button
                    onClick={onBack}
                    className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="font-semibold text-gray-900 truncate flex-1 mx-2">Request Details</h2>
                {isOwner && (
                    <button
                        onClick={() => onDelete(request.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        title="Delete request"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Request Card */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-unicycle-blue to-unicycle-green rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {request.author?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{request.author?.name}</h3>
                            <p className="text-xs text-gray-500">{request.author?.university}</p>
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(request.created_at)}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {request.urgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                🔥 URGENT
                            </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {request.category}
                        </span>
                        {request.budget_min && request.budget_max && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                💰 ${request.budget_min} - ${request.budget_max}
                            </span>
                        )}
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 mb-2">{request.title}</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>
                </div>

                {/* Replies */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Replies ({request.replies?.length || 0})
                    </h3>

                    {request.replies?.length === 0 && (
                        <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
                            <p className="text-gray-500 text-sm">No replies yet. Be the first to help!</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {request.replies?.map((reply) => (
                            <div key={reply.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${reply.author_id === request.author_id
                                        ? 'bg-gradient-to-br from-unicycle-blue to-unicycle-green'
                                        : 'bg-gray-400'
                                        }`}>
                                        {reply.author?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm text-gray-900">
                                                {reply.author?.name}
                                            </span>
                                            {reply.author_id === request.author_id && (
                                                <span className="px-1.5 py-0.5 bg-unicycle-blue/10 text-unicycle-blue text-xs rounded">
                                                    OP
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {formatTimeAgo(reply.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{reply.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reply Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendReply()}
                        placeholder="Write a reply..."
                        className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        disabled={sending}
                    />
                    <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sending}
                        className="p-2.5 bg-unicycle-green text-white rounded-full hover:bg-unicycle-green/90 disabled:opacity-50 flex-shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════
// POST REQUEST FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════
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
    const [error, setError] = useState('');

    const categories = ['Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Sports & Outdoors', 'Kitchen', 'Room Decor', 'Other'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.description.trim()) {
            setError('Please fill in title and description');
            return;
        }

        setLoading(true);
        setError('');

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
        } catch (err) {
            console.error('Error creating request:', err);
            setError('Failed to post request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md lg:max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Post a Request</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-md lg:max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Title */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">What are you looking for?</label>
                    <input
                        type="text"
                        placeholder="e.g., ISO: Mini Fridge under $70"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                    />
                    <p className="text-xs text-gray-400 mt-1">Tip: Start with "ISO:" or "WTB:" to get more replies</p>
                </div>

                {/* Category & Urgency */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Urgency</label>
                        <button
                            onClick={() => handleInputChange('urgent', !formData.urgent)}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${formData.urgent
                                ? 'bg-red-100 text-red-700 border border-red-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                                }`}
                        >
                            🔥 {formData.urgent ? 'Urgent' : 'Not Urgent'}
                        </button>
                    </div>
                </div>

                {/* Budget */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Budget (CAD)</label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="number"
                                placeholder="Min"
                                value={formData.budgetMin}
                                onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                        </div>
                        <span className="text-gray-400 font-medium">—</span>
                        <div className="flex-1 relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="number"
                                placeholder="Max"
                                value={formData.budgetMax}
                                onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                    <textarea
                        placeholder="Describe what you're looking for, condition, any specific requirements..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none"
                    />
                </div>

                {/* Preview */}
                {formData.title && (
                    <div className="bg-gradient-to-r from-unicycle-blue/10 to-unicycle-green/10 rounded-lg p-4 border border-unicycle-blue/30">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Preview</p>
                        <div className="flex items-center gap-2 mb-1">
                            {formData.urgent && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">🔥 URGENT</span>
                            )}
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{formData.category}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formData.title}</p>
                        {formData.description && <p className="text-xs text-gray-600 mt-1">{formData.description}</p>}
                        {formData.budgetMin && formData.budgetMax && (
                            <p className="text-xs text-unicycle-green font-medium mt-1">Budget: ${formData.budgetMin} - ${formData.budgetMax}</p>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!formData.title || !formData.description || loading}
                    className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {loading ? 'Posting...' : 'Post Request'}
                </button>
            </div>
        </div>
    );
}