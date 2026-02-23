import apiClient from './client';

export const signup = async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const resendVerification = async () => {
    const response = await apiClient.post('/auth/resend-verification');
    return response.data;
};

export const setPassword = async (token, password) => {
    const response = await apiClient.post('/auth/set-password', { token, password });
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token, password) => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
};