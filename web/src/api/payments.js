import client from './client';

export const createBoostSession = async (listingId) => {
    const response = await client.post('/payments/boost/create-session', { listing_id: listingId });
    return response.data;
};

export const activateBoost = async (listingId, sessionId) => {
    const response = await client.post('/payments/boost/activate', { listing_id: listingId, session_id: sessionId });
    return response.data;
};

export const createSecurePaySession = async (listingId) => {
    const response = await client.post('/payments/secure-pay/create-session', { listing_id: listingId });
    return response.data;
};

export const activateSecurePay = async (listingId, sessionId) => {
    const response = await client.post('/payments/secure-pay/activate', { listing_id: listingId, session_id: sessionId });
    return response.data;
};

export const confirmReceipt = async (transactionId) => {
    const response = await client.post(`/payments/secure-pay/${transactionId}/confirm-receipt`);
    return response.data;
};

export const disputeTransaction = async (transactionId) => {
    const response = await client.post(`/payments/secure-pay/${transactionId}/dispute`);
    return response.data;
};
