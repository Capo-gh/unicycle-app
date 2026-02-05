import apiClient from './client';

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const uploadImages = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

    const response = await apiClient.post('/upload/images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteImage = async (publicId) => {
    const response = await apiClient.delete(`/upload/image/${encodeURIComponent(publicId)}`);
    return response.data;
};