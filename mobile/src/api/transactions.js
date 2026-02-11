import api from './client';

export const createTransaction = async (listingId) => {
    const response = await api.post('/transactions/', { listing_id: listingId });
    return response.data;
};

export const getMyTransactions = async (asBuyer = true) => {
    const response = await api.get('/transactions/my', {
        params: { as_buyer: String(asBuyer) }
    });
    return response.data;
};

export const updateTransactionStatus = async (id, status) => {
    const response = await api.put(`/transactions/${id}`, { status });
    return response.data;
};

export const getMyStats = async () => {
    const response = await api.get('/transactions/stats');
    return response.data;
};
