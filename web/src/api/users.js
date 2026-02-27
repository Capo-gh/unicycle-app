import apiClient from './client';

export const getUserProfile = async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
};

export const reportUser = async (userId, reason, details = '') => {
    const response = await apiClient.post(`/users/${userId}/report`, { reason, details });
    return response.data;
};

export const updateProfile = async (fields) => {
    // accepts { name } or { avatar_url } or both
    const response = await apiClient.put('/users/me', fields);
    return response.data;
};