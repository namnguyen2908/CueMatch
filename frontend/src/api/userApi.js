import api from "./authApi";

const userApi = {

    getUserDetail: async (userId) => {
        const path = userId ? `/user/detail-user/${userId}` : '/user/detail-user';
        const res = await api.get(path);
        return res.data;
    },

    updateUser: async (formData) => {
        const res = await api.put('/user/edit-user', formData);
        return res.data;
    },

    // 🆕 Lấy danh sách tất cả người dùng (có phân trang, search)
    getAllUsers: async (params = {}) => {
        const res = await api.get('/user/all-users', { params });
        return res.data;
    },

    // 🆕 Xoá người dùng
    deleteUser: async (userId) => {
        const res = await api.delete(`/user/delete-user/${userId}`);
        return res.data;
    },

    // 🆕 Lấy thống kê người dùng
    getUserStats: async () => {
        const res = await api.get('/user/stats');
        return res.data;
    },

    getUserGrowth: async () => {
        const res = await api.get('/user/growth');
        return res.data;
    },

    // Heartbeat để renew TTL trong Redis
    heartbeat: async () => {
        const res = await api.post('/user/heartbeat');
        return res.data;
    },

    // Get wallet balance
    getWalletBalance: async () => {
        const res = await api.get('/user/wallet/balance');
        return res.data;
    },

    // Get wallet transactions
    getWalletTransactions: async (page = 1, limit = 10) => {
        const res = await api.get('/user/wallet/transactions', { params: { page, limit } });
        return res.data;
    }
}

export default userApi;