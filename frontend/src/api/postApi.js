// src/api/postApi.js
import api from './api';

const postApi = {
  getPosts: async (offset = 0, limit = 10) => {
    try {
      const response = await api.get('/post/', {
        params: { offset, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  getPostById: async (id) => {
    try {
      const response = await api.get(`/post/detail/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      throw error;
    }
  },

  createPost: async (data) => {
    try {
      const response = await api.post('/post/create', data);
      console.log('Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  updatePost: async (id, data) => {
    try {
      const response = await api.put(`/post/update/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/post/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      throw error;
    }
  }
};



export default postApi;