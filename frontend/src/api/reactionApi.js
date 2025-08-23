import api from './api';

const reactionApi = {
    reactionToPost: async (PostID, Type) => {
        const res = await api.post('/reaction/reactToPost', {PostID, Type});
        return res.data;
    },

    deleteReaction: async (PostID) => {
        const res = await api.delete('/reaction/deleteReaction', {data: { PostID }});
        return res.data;
    }
};

export default reactionApi;