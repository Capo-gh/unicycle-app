import apiClient from './client';

export const getListings = async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.university) queryParams.append('university', params.university);
    if (params.include_sold) queryParams.append('include_sold', 'true');
    if (params.min_price) queryParams.append('min_price', params.min_price);
    if (params.max_price) queryParams.append('max_price', params.max_price);
    if (params.condition) queryParams.append('condition', params.condition);
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = queryString ? `/listings/?${queryString}` : '/listings/';

    const response = await apiClient.get(url);
    return response.data;
};

export const getListing = async (id) => {
    const response = await apiClient.get(`/listings/${id}`);
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

export const markAsSold = async (id) => {
    const response = await apiClient.post(`/listings/${id}/sold`);
    return response.data;
};

export const markAsUnsold = async (id) => {
    const response = await apiClient.post(`/listings/${id}/unsold`);
    return response.data;
};

export const getUserListings = async (userId, includeSold = true) => {
    const url = `/listings/user/${userId}?include_sold=${includeSold}`;
    const response = await apiClient.get(url);
    return response.data;
};

export const getMyListings = async () => {
    const response = await apiClient.get('/listings/my');
    return response.data;
};

export const renewListing = async (id) => {
    const response = await apiClient.post(`/listings/${id}/renew`);
    return response.data;
};

export const bumpListing = async (id) => {
    const response = await apiClient.post(`/listings/${id}/bump`);
    return response.data;
};