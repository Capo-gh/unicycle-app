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