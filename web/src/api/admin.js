import apiClient from './client';

export const getAdminStats = async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
};

export const getAdminUsers = async (search = '', university = '') => {
    const params = {};
    if (search) params.search = search;
    if (university) params.university = university;
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
};

export const toggleUserAdmin = async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/toggle-admin`);
    return response.data;
};

export const toggleUserSuspend = async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/suspend`);
    return response.data;
};

export const getAdminListings = async (search = '', university = '') => {
    const params = {};
    if (search) params.search = search;
    if (university) params.university = university;
    const response = await apiClient.get('/admin/listings', { params });
    return response.data;
};

export const toggleListingActive = async (listingId) => {
    const response = await apiClient.put(`/admin/listings/${listingId}/deactivate`);
    return response.data;
};

export const adminDeleteListing = async (listingId) => {
    const response = await apiClient.delete(`/admin/listings/${listingId}`);
    return response.data;
};

export const getAdminTransactions = async (university = '') => {
    const params = {};
    if (university) params.university = university;
    const response = await apiClient.get('/admin/transactions', { params });
    return response.data;
};

export const getUniversities = async () => {
    const response = await apiClient.get('/admin/universities');
    return response.data;
};

export const resolveDispute = async (transactionId, action) => {
    const response = await apiClient.post(`/admin/transactions/${transactionId}/resolve`, { action });
    return response.data;
};
