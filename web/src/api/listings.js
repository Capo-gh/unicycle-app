import apiClient from './client';

export const getListings = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.search) params.append('search', filters.search);
    if (filters.university) params.append('university', filters.university);

    const queryString = params.toString();
    const url = queryString ? `/listings/?${queryString}` : '/listings/';

    const response = await apiClient.get(url);
    return response.data;
};

export const getListing = async (id) => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
};

export const getMyListings = async () => {
    const response = await apiClient.get('/listings/my');
    return response.data;
};

export const createListing = async (listingData) => {
    const response = await apiClient.post('/listings/', listingData);
    return response.data;
};

export const updateListing = async (id, listingData) => {
    const response = await apiClient.put(`/listings/${id}`, listingData);
    return response.data;
};

export const deleteListing = async (id) => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data;
};