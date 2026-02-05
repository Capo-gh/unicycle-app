import apiClient from './client';

// ═══════════════════════════════════════════════════════════════════
// REQUEST ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

export const getAllRequests = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.university) params.append('university', filters.university);
    if (filters.urgent !== undefined) params.append('urgent', filters.urgent);

    const response = await apiClient.get(`/requests?${params.toString()}`);
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
    const response = await apiClient.post('/requests', requestData);
    return response.data;
};

export const updateRequest = async (id, requestData) => {
    const response = await apiClient.put(`/requests/${id}`, requestData);
    return response.data;
};

export const deleteRequest = async (id) => {
    await apiClient.delete(`/requests/${id}`);
};

// REPLY ENDPOINTS

export const createReply = async (requestId, text) => {
    const response = await apiClient.post(`/requests/${requestId}/replies`, { text });
    return response.data;
};

export const deleteReply = async (requestId, replyId) => {
    await apiClient.delete(`/requests/${requestId}/replies/${replyId}`);
};