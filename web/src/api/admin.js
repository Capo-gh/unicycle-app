import apiClient from './client';

export const getAdminStats = async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
};

export const getAdminUsers = async (search = '') => {
    const params = search ? { search } : {};
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

export const getAdminListings = async (search = '') => {
    const params = search ? { search } : {};
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

export const getAdminTransactions = async () => {
    const response = await apiClient.get('/admin/transactions');
    return response.data;
};
