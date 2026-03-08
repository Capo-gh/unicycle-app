import apiClient from './client';

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/image', formData, {
        timeout: 60000,
        headers: { 'Content-Type': undefined },
    });
    return response.data.url;
};

export const uploadImages = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

    const response = await apiClient.post('/upload/images', formData, {
        timeout: 60000,
        headers: { 'Content-Type': undefined },
    });
    return response.data;
};

export const deleteImage = async (publicId) => {
    const response = await apiClient.delete(`/upload/image/${encodeURIComponent(publicId)}`);
    return response.data;
};