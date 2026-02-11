import api from './client';

export const getListings = async (params = {}) => {
    const response = await api.get('/listings/', { params });
    return response.data;
};

export const getMyListings = async () => {
    const response = await api.get('/listings/my');
    return response.data;
};

export const getListing = async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
};

export const createListing = async (listingData) => {
    const response = await api.post('/listings/', listingData);
    return response.data;
};

export const updateListing = async (id, listingData) => {
    const response = await api.put(`/listings/${id}`, listingData);
    return response.data;
};

export const deleteListing = async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
};

export const uploadImages = async (formData) => {
    const response = await api.post('/upload/images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
