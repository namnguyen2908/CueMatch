// src/api/paymentApi.js
import api from './api';

const paymentApi = {
  // Create payment order
  createPaymentOrder: async ({ planId, userId }) => {
    const res = await api.post('/payment/create-order', { planId, userId });
    return res.data;
  },

  getOrderStatus: async (orderCode) => {
    const res = await api.get(`/payment/status/${orderCode}`);
    return res.data;
  },

  renewSubscription: async ({ planId }) => {
    const res = await api.post('/payment/renew-subplan', { planId });
    return res.data;
  },

  getSubscriptionStatus: async () => {
    const res = await api.get('/payment/status-sub');
    return res.data;
  },

  // Get user transactions list
  getUserTransactions: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) {
      params.status = status;
    }
    const res = await api.get('/payment/transactions', { params });
    return res.data;
  },

  // Get transaction details by ID
  getTransactionById: async (transactionId) => {
    const res = await api.get(`/payment/transactions/${transactionId}`);
    return res.data;
  },

  // Create booking payment order
  createBookingPaymentOrder: async (bookingData) => {
    const res = await api.post('/payment/create-booking-payment', { bookingData });
    return res.data;
  }
};

export default paymentApi;