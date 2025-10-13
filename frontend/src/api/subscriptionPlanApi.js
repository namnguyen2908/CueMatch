// src/api/subscriptionPlanApi.js
import api from './api';

const subscriptionPlanApi = {
  // Lấy tất cả các gói (chỉ dành cho admin)
  getAllPlans: async () => {
    const res = await api.get('/subscriptionPlan/get-all-plans');
    return res.data;
  },

  // Lấy chi tiết gói theo ID (chỉ dành cho admin)
  getPlanById: async (planId) => {
    const res = await api.get(`/subscriptionPlan/get-plan-by-id/${planId}`);
    return res.data;
  },

  // Tạo gói mới (chỉ dành cho admin)
  createPlan: async (planData) => {
    const res = await api.post('/subscriptionPlan/create-plan', planData);
    return res.data;
  },

  // Cập nhật gói (chỉ dành cho admin)
  updatePlan: async (id, updateData) => {
    const res = await api.put(`/subscriptionPlan/update-plan/${id}`, updateData);
    return res.data;
  },

  // Disable gói (chỉ dành cho admin)
  disablePlan: async (id) => {
    const res = await api.put(`/subscriptionPlan/disable-plan/${id}`);
    return res.data;
  },

  // Lấy danh sách gói theo type (public)
  getPlanByType: async (type) => {
    const res = await api.get('/subscriptionPlan/get-plan-by-type', {
      params: { type },
    });
    return res.data;
  },
};

export default subscriptionPlanApi;