import apiClient from './client';

export const toggleSave = async (listingId) => {
    const response = await apiClient.post(`/saved/${listingId}`);
    return response.data; // { saved: bool }
};

export const getSaved = async () => {
    const response = await apiClient.get('/saved/');
    return response.data;
};

export const getSavedIds = async () => {
    const response = await apiClient.get('/saved/ids');
    return response.data; // number[]
};
