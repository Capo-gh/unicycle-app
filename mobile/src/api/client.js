import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../shared/config/api';
import { triggerLogout } from './authCallback';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const detail = error.response?.data?.detail || '';
        if (status === 401 || (status === 403 && detail.toLowerCase().includes('suspended'))) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            triggerLogout();
        }
        return Promise.reject(error);
    }
);

export default api;
