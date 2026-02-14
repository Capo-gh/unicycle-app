import client from './client';

/**
 * Create a new transaction (buyer expresses interest)
 */
export const createTransaction = async (listingId) => {
    const response = await client.post('/transactions/', { listing_id: listingId });
    return response.data;
};

/**
 * Get my transactions (as buyer or seller)
 */
export const getMyTransactions = async (asBuyer = true) => {
    const response = await client.get('/transactions/my', {
        params: { as_buyer: asBuyer }
    });
    return response.data;
};

/**
 * Update transaction status
 */
export const updateTransaction = async (transactionId, status) => {
    const response = await client.put(`/transactions/${transactionId}`, { status });
    return response.data;
};

/**
 * Get my transaction statistics
 */
export const getMyStats = async () => {
    const response = await client.get('/transactions/stats');
    return response.data;
};

/**
 * Get transaction statistics for a specific user
 */
export const getUserStats = async (userId) => {
    const response = await client.get(`/transactions/stats/${userId}`);
    return response.data;
};

/**
 * Remove interest (delete transaction)
 */
export const deleteTransaction = async (transactionId) => {
    const response = await client.delete(`/transactions/${transactionId}`);
    return response.data;
};
