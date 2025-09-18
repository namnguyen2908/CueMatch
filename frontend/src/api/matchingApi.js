import api from './api';

const matchingApi = {
    getPlayerList: async (playType) => {
        const res = await api.get('/matching/get-player-list', {params: { playType }});
        return res.data;
    },

    sendInvitation: async (invitationData) => {
        // invitationData nên bao gồm: toUser, Location, MatchDate, TimeStart, TimeEnd, PlayType, Message
        const res = await api.post('/matching/send-invitation', invitationData);
        return res.data;
    },

    acceptInvitation: async (invitationId) => {
        const res = await api.post(`/matching/accept-invitation/${invitationId}`);
        return res.data;
    },

    getInvitations: async () => {
        const res = await api.get('/matching/get-invitations');
        return res.data;
    },

    declineInvitation: async (invitationId) => {
        const res = await api.post(`/matching/decline-invitation/${invitationId}`);
        return res.data;
    },

    getSentInvitation: async () => {
        const res = await api.get('/matching/get-sent-invitation');
        return res.data;
    },

    cancelInvitation: async (invitationId) => {
        const res = await api.post(`/matching/cancel-invitation/${invitationId}`);
        return res.data;
    },

    getMatchHistory: async (status) => {
        const res = await api.get('/matching/get-match-history', { params: { status } });
        return res.data;
    },

    getUpcomingMatches: async () => {
        const res = await api.get('/matching/get-upcoming-matching');
        return res.data;
    }
};

export default matchingApi;