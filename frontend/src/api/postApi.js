// src/api/postApi.js
import api from './api';

const postApi = {
  getPosts: async (offset = 0, limit = 10) => {
    const res = await api.get('/post/', {
      params: { offset, limit },
    });
    return res.data;
  },

  getPostById: async (id) => {
    const res = await api.get(`/post/detail/${id}`);
    return res.data;
  },

  createPost: async (formData) => {
    // Không cần set headers (multipart), Axios sẽ tự làm
    const res = await api.post('/post/create', formData);
    return res.data;
  },

  updatePost: async (id, data) => {
    const res = await api.put(`/post/update/${id}`, data);
    return res.data;
  },

  deletePost: async (id) => {
    const res = await api.delete(`/post/delete/${id}`);
    return res.data;
  },

  getMyPosts: async (offset = 0, limit = 10) => {
    const res = await api.get('/post/my-posts', {
      params: { offset, limit },
    });
    return res.data;
  },
};



export default postApi;