import api from './authApi';

const adminApi = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
};

export default adminApi;

