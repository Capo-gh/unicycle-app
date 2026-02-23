import apiClient from './client';

export const getAdminStats = async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
};

export const getAdminStatsHistory = async () => {
    const response = await apiClient.get('/admin/stats/history');
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

export const emailUser = async (userId, subject, message) => {
    const response = await apiClient.post(`/admin/users/${userId}/email`, { subject, message });
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

export const getAdminReports = async (reportStatus = '') => {
    const params = {};
    if (reportStatus) params.report_status = reportStatus;
    const response = await apiClient.get('/admin/reports', { params });
    return response.data;
};

export const dismissReport = async (reportId) => {
    const response = await apiClient.put(`/admin/reports/${reportId}/dismiss`);
    return response.data;
};

export const actionReport = async (reportId) => {
    const response = await apiClient.put(`/admin/reports/${reportId}/action`);
    return response.data;
};

export const getAdminReviews = async (search = '') => {
    const params = {};
    if (search) params.search = search;
    const response = await apiClient.get('/admin/reviews', { params });
    return response.data;
};

export const adminDeleteReview = async (reviewId) => {
    const response = await apiClient.delete(`/admin/reviews/${reviewId}`);
    return response.data;
};

export const getAdminLogs = async () => {
    const response = await apiClient.get('/admin/logs');
    return response.data;
};
