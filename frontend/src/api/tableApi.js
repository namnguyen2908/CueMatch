import api from './api';

// API giả lập
const tableApi = {
  createTable: async (data) => {
    const res = await api.post('/billiard-table/create-table', data);
    return res.data;
  },

  getTableByClub: async (clubId) => {
    const res = await api.get(`/billiard-table/get-table/${clubId}`);
    return res.data;
  },

  updateTable: async (id, newData) => {
    const res = await api.put(`/billiard-table/edit-table/${id}`, newData);
    return res.data;
  },

  deleteTable: async (id) => {
    const res = await api.delete(`/billiard-table/delete-table/${id}`);
    return res.data;
  },

  getDetailTable: async (id) => {
    const res = await api.get(`/billiard-table/detail-table/${id}`);
    return res.data;
  }
};

export default tableApi;