import api from './api';

const billiardsClubApi = {
    getAllClubs: async () => {
        const res = await api.get('/billiard-club/clubs');
        return res.data;
    },

    getClubById: async (id) => {
        const res = await api.get(`/billiard-club/detail-club/${id}`);
        return res.data;
    },

    createClub: async (data) => {
        const res = await api.post('/billiard-club/create-club', data);
        return res.data;
    },

    getMyClubs: async () => {
        const res = await api.get('/billiard-club/my-club');
        return res.data;
    },

    updateClub: async (id, data) => {
        const res = await api.put(`/billiard-club/update-club/${id}`, data);
        return res.data;
    },

    deleteClub: async (id) => {
        const res = await api.delete(`/billiard-club/delete-club/${id}`);
        return res.data;
    }
}

export default billiardsClubApi;