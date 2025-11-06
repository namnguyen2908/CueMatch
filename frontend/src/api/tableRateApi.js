import api from './api';

const tableRateApi = {
    createTableRate: async (clubId, data) => {
        const res = await api.post(`/table-rate/create-price/${clubId}`, data);
        return res.data;
    },

    updateTableRate: async (clubId, type, data) => {
        const res = await api.put(`/table-rate/update-price/${clubId}/${type}`, data);
        return res.data;
    },

    getTableRate: async (clubId, type) => {
        const res = await api.get(`/table-rate/get-price/${clubId}/${type}`);
        return res.data;
    }
};

export default tableRateApi;