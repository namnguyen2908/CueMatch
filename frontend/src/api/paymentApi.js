// src/api/paymentApi.js
import api from './api';

const paymentApi = {
  // Gọi API tạo đơn thanh toán
  createPaymentOrder: async ({ planId, userId }) => {
    const res = await api.post('/payment/create-order', { planId, userId });
    return res.data;
  },

  getOrderStatus: async (orderCode) => {
    const res = await api.get(`/payment/status/${orderCode}`);
    return res.data;
  }
};

export default paymentApi;