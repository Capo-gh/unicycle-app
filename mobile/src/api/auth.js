import api from './client';

export const signup = async (name, email, password, university) => {
    const response = await api.post('/auth/signup', {
        name,
        email,
        password,
        university
    });
    return response.data;
};

export const login = async (email, password) => {
    const response = await api.post('/auth/login', {
        email,
        password
    });
    return response.data;
};

export const verifyEmail = async (token) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const resendVerification = async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
};
