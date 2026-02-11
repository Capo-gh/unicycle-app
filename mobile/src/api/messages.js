import api from './client';

export const getConversations = async () => {
    const response = await api.get('/messages/conversations');
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

export const sendMessage = async (conversationId, text) => {
    const response = await api.post(`/messages/conversations/${conversationId}/messages`, {
        text
    });
    return response.data;
};

export const archiveConversation = async (id) => {
    const response = await api.delete(`/messages/conversations/${id}`);
    return response.data;
};
