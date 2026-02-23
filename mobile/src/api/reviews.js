import api from './client';

export const createReview = async (reviewData) => {
    const response = await api.post('/reviews/', reviewData);
    return response.data;
};

export const getUserReviews = async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
};
