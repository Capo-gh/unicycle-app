import apiClient from './client';

export const getAllListings = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.university) params.append('university', filters.university);

    const response = await apiClient.get(`/listings?${params.toString()}`);
    return response.data;
};

export const getListing = async (id) => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
};

export const createListing = async (listingData) => {
    const response = await apiClient.post('/listings', listingData);
    return response.data;
};

export const updateListing = async (id, listingData) => {
    const response = await apiClient.put(`/listings/${id}`, listingData);
    return response.data;
};

export const deleteListing = async (id) => {
    await apiClient.delete(`/listings/${id}`);
};