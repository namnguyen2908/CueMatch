import api from './api';

const withdrawalApi = {
  // Create withdrawal request
  createWithdrawal: async (data) => {
    const res = await api.post('/withdrawal/create', data);
    return res.data;
  },

  // Get my withdrawals
  getMyWithdrawals: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) {
      params.status = status;
    }
    const res = await api.get('/withdrawal/my-withdrawals', { params });
    return res.data;
  },

  // Get withdrawal by ID
  getWithdrawalById: async (withdrawalId) => {
    const res = await api.get(`/withdrawal/${withdrawalId}`);
    return res.data;
  },

  // Admin: Get all withdrawals
  getAllWithdrawals: async (page = 1, limit = 20, status = null) => {
    const params = { page, limit };
    if (status) {
      params.status = status;
    }
    const res = await api.get('/withdrawal/admin/all', { params });
    return res.data;
  },

  // Admin: Approve withdrawal
  approveWithdrawal: async (withdrawalId) => {
    const res = await api.put(`/withdrawal/admin/approve/${withdrawalId}`);
    return res.data;
  },

  // Admin: Reject withdrawal
  rejectWithdrawal: async (withdrawalId, reason) => {
    const res = await api.put(`/withdrawal/admin/reject/${withdrawalId}`, { reason });
    return res.data;
  }
};

export default withdrawalApi;

