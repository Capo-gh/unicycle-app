import api from './client';

export const getAllRequests = async (filters = {}) => {
    const params = {};

    if (filters.category) params.category = filters.category;
    if (filters.urgent !== undefined) params.urgent = filters.urgent;
    if (filters.search) params.search = filters.search;
    if (filters.university) params.university = filters.university;

    const response = await api.get('/requests/', { params });
    return response.data;
};

export const getRequest = async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
};

export const getMyRequests = async () => {
    const response = await api.get('/requests/my');
    return response.data;
};

export const createRequest = async (requestData) => {
    const response = await api.post('/requests/', requestData);
    return response.data;
};

export const updateRequest = async (id, requestData) => {
    const response = await api.put(`/requests/${id}`, requestData);
    return response.data;
};

export const deleteRequest = async (id) => {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
};

export const createReply = async (requestId, text, parentReplyId = null) => {
    const response = await api.post(`/requests/${requestId}/replies`, {
        text,
        parent_reply_id: parentReplyId
    });
    return response.data;
};

export const deleteReply = async (requestId, replyId) => {
    const response = await api.delete(`/requests/${requestId}/replies/${replyId}`);
    return response.data;
};
