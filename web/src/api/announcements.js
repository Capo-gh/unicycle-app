import client from './client';

export const getActiveAnnouncement = async () => {
    const response = await client.get('/announcements/active');
    return response.data;
};

export const dismissAnnouncement = async (id) => {
    const response = await client.post(`/announcements/${id}/dismiss`);
    return response.data;
};

export const createAnnouncement = async (data) => {
    const response = await client.post('/admin/announcements', data);
    return response.data;
};

export const getAdminAnnouncements = async () => {
    const response = await client.get('/admin/announcements');
    return response.data;
};

export const toggleAnnouncement = async (id) => {
    const response = await client.put(`/admin/announcements/${id}/toggle`);
    return response.data;
};

export const deleteAnnouncement = async (id) => {
    const response = await client.delete(`/admin/announcements/${id}`);
    return response.data;
};
