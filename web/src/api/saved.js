import apiClient from './client';

export const toggleSave = async (listingId) => {
    const response = await apiClient.post(`/saved/${listingId}`);
    return response.data; // { saved: true/false }
};

export const getSavedIds = async () => {
    const response = await apiClient.get('/saved/ids');
    return response.data.ids; // number[]
};

export const getSaved = async () => {
    const response = await apiClient.get('/saved/');
    return response.data; // ListingResponse[]
};
