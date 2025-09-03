import api from './api';

const reactionApi = {
    reactionToPost: async (PostID, Type) => {
        const res = await api.post('/reaction/reactToPost', { PostID, Type });
        return res.data;
    },

    deleteReaction: async (PostID) => {
        const res = await api.delete('/reaction/deleteReaction', { data: { PostID } });
        return res.data;
    },

    getReactionsGroupedByType : async (postId) => {
        // Giữ nguyên gọi không truyền type để lấy tất cả reaction
        const res = await api.get(`/reaction/${postId}/reactions`);
        return res.data; // Trả về object { like: [...], love: [...], ... }
    }
};

export default reactionApi;