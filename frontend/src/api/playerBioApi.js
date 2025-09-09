import api from './api';

const playerBioApi = {
    createPlayerBio: async (formData) => {
        const res = await api.post('/playerBio/create-bio', formData);
        return res.data;
    },

    updatePlayerBio: async (formData) => {
        const res = await api.put('/playerBio/edit-bio', formData);
        return res.data;
    },

    getPlayerBioByUserId: async (userId) => {
        const res = await api.get(`/playerBio/bio/${userId}`);
        return res.data;
    },

    deletePlayerBio: async () => {
        const res = await api.delete('/playerBio/delete-bio');
        return res.data;
    },
};

export default playerBioApi;