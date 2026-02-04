import apiClient from './client';

export const signup = async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
};

export const login = async (email) => {
    const response = await apiClient.post('/auth/login', { email });
    return response.data;
};

export const getCurrentUser = async (token) => {
    const response = await apiClient.get(`/auth/me?token=${token}`);
    return response.data;
};