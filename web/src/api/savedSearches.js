import apiClient from './client';

export const saveSearch = async (params) => {
    const response = await apiClient.post('/saved-searches/', params);
    return response.data;
};

export const getSavedSearches = async () => {
    const response = await apiClient.get('/saved-searches/');
    return response.data;
};

export const deleteSavedSearch = async (id) => {
    await apiClient.delete(`/saved-searches/${id}`);
};
