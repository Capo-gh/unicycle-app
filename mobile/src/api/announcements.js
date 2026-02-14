import api from './client';

export const getActiveAnnouncement = async () => {
    const response = await api.get('/announcements/active');
    return response.data;
};

export const dismissAnnouncement = async (id) => {
    const response = await api.post(`/announcements/${id}/dismiss`);
    return response.data;
};
