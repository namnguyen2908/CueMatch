import api from './api';

const commentApi = {
    getCommentsByPost: async (postId) => {
        const res = await api.get(`/comment/post/${postId}`);
        return res.data.data;
    },

    createComment: async ({ PostID, ParentID = null, Content}) => {
        const res = await api.post(`/comment/create`, { PostID, ParentID, Content });
        return res.data.data;
    },

    toggleLikeComment: async (commentId) => {
        const res = await api.put(`/comment/like/${commentId}`);
        return res.data.data;
    },

    deleteComment: async (commentId) => {
        const res = await api.delete(`/comment/delete/${commentId}`);
        return res.data.data;
    },
}

export default commentApi;