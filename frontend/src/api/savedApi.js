import api from './api';

const savedApi = {
    // 1. Lưu bài viết
    savePost: async (postId) => {
        const res = await api.post('/savedPost/savedPost', { postId });
        return res.data;
    },

    // 2. Bỏ lưu bài viết
    unsavePost: async (postId) => {
        const res = await api.delete(`/savedPost/unsavePost/${postId}`);
        return res.data;
    },

    // 3. Lấy danh sách bài viết đã lưu
    getSavedPosts: async () => {
        const res = await api.get('/savedPost/get-savePost');
        return res.data;
    },

    // 4. Kiểm tra xem bài viết đã được lưu chưa
    isPostSaved: async (postId) => {
        const res = await api.get(`/savedPost/check-saved/${postId}`);
        return res.data; // expected: { isSaved: true/false }
    }
};

export default savedApi;