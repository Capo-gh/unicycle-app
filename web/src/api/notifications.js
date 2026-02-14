import client from './client';

export const getNotifications = async () => {
    const response = await client.get('/notifications');
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await client.get('/notifications/unread-count');
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await client.put(`/notifications/${id}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await client.put('/notifications/read-all');
    return response.data;
};

export const sendBroadcast = async (data) => {
    const response = await client.post('/admin/notifications/broadcast', data);
    return response.data;
};

export const getAdminNotifications = async () => {
    const response = await client.get('/admin/notifications');
    return response.data;
};
