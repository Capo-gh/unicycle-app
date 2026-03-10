import apiClient from './client';

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

export const getConversations = async ({ includeArchived = false } = {}) => {
    const response = await apiClient.get('/messages/conversations', {
        params: includeArchived ? { include_archived: true } : {}
    });
    return response.data;
};

export const getConversation = async (conversationId) => {
    const response = await apiClient.get(`/messages/conversations/${conversationId}`);
    return response.data;
};

export const createConversation = async (listingId, initialMessage) => {
    const response = await apiClient.post('/messages/conversations', {
        listing_id: listingId,
        initial_message: initialMessage
    });
    return response.data;
};

export const archiveConversation = async (conversationId) => {
    await apiClient.delete(`/messages/conversations/${conversationId}`);
};

export const unarchiveConversation = async (conversationId) => {
    await apiClient.put(`/messages/conversations/${conversationId}/unarchive`);
};


// MESSAGE ENDPOINTS
export const sendMessage = async (conversationId, text) => {
    const response = await apiClient.post(`/messages/conversations/${conversationId}/messages`, {
        text
    });
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await apiClient.get('/messages/unread-count');
    return response.data;
};
