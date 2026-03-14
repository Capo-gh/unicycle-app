import api from './client';

export const getConversations = async ({ includeArchived = false } = {}) => {
    const response = await api.get('/messages/conversations', {
        params: includeArchived ? { include_archived: true } : {}
    });
    return response.data;
};

export const getConversation = async (id) => {
    const response = await api.get(`/messages/conversations/${id}`);
    return response.data;
};

export const createConversation = async (listingId, initialMessage) => {
    const response = await api.post('/messages/conversations', {
        listing_id: listingId,
        initial_message: initialMessage
    });
    return response.data;
};

export const sendMessage = async (conversationId, text, replyToId = null, imageUrl = null) => {
    const response = await api.post(`/messages/conversations/${conversationId}/messages`, {
        text,
        ...(replyToId ? { reply_to_id: replyToId } : {}),
        ...(imageUrl ? { image_url: imageUrl } : {})
    });
    return response.data;
};

export const archiveConversation = async (id) => {
    const response = await api.delete(`/messages/conversations/${id}`);
    return response.data;
};

export const unarchiveConversation = async (id) => {
    await api.put(`/messages/conversations/${id}/unarchive`);
};

export const hideMessage = async (conversationId, messageId) => {
    await api.delete(`/messages/conversations/${conversationId}/messages/${messageId}`);
};
