import apiClient from './client';

export const createReview = async (reviewData) => {
    const response = await apiClient.post('/reviews/', reviewData);
    return response.data;
};

export const getUserReviews = async (userId) => {
    const response = await apiClient.get(`/reviews/user/${userId}`);
    return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
    const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
};