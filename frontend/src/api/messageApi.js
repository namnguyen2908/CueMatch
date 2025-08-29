// src/api/messageApi.js
import api from './api';

// 📨 Gửi tin nhắn (kèm file nếu có)
export const sendMessage = (formData) => {
  return api.post('/message/send-message', formData, {
  });
};

// 📩 Lấy tất cả tin nhắn của 1 cuộc trò chuyện
export const getMessages = (conversationId) => {
  return api.get(`/message/messages/${conversationId}`);
};

// 📬 Tạo cuộc trò chuyện (group hoặc single)
export const createConversation = (data) => {
  return api.post('/message/create-conversation', data);
};

// 📚 Lấy tất cả conversation của user
export const getConversations = () => {
  return api.get('/message/get-conversation');
};