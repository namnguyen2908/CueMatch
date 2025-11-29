import api from './api';

const searchApi = {
  globalSearch: async (params) => {
    const res = await api.get('/search', { params });
    return res.data;
  }
};

export default searchApi;

