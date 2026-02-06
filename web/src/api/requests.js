import apiClient from './client';

export const getAllRequests = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.urgent !== undefined) params.append('urgent', filters.urgent);
    if (filters.search) params.append('search', filters.search);
    if (filters.university) params.append('university', filters.university);

    const queryString = params.toString();
    const url = queryString ? `/requests/?${queryString}` : '/requests/';

    const response = await apiClient.get(url);
    return response.data;
};

export const getRequest = async (id) => {
    const response = await apiClient.get(`/requests/${id}`);
    return response.data;
};

export const getMyRequests = async () => {
    const response = await apiClient.get('/requests/my');
    return response.data;
};

export const createRequest = async (requestData) => {
    const response = await apiClient.post('/requests/', requestData);
    return response.data;
};

export const updateRequest = async (id, requestData) => {
    const response = await apiClient.put(`/requests/${id}`, requestData);
    return response.data;
};

export const deleteRequest = async (id) => {
    const response = await apiClient.delete(`/requests/${id}`);
    return response.data;
};

// Reply endpoints - now supports nested replies
export const createReply = async (requestId, text, parentReplyId = null) => {
    const response = await apiClient.post(`/requests/${requestId}/replies`, {
        text,
        parent_reply_id: parentReplyId
    });
    return response.data;
};

export const deleteReply = async (requestId, replyId) => {
    const response = await apiClient.delete(`/requests/${requestId}/replies/${replyId}`);
    return response.data;
};