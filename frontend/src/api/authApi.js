import axios from 'axios';
import api from './api'; // Assuming you have a base API instance

export const register = (user) => {
    return api.post('/auth/register', user);
};

export const login = (user) => {
    return api.post('/auth/login', user);
};

// Làm mới token
export const refreshToken = () => {
  return api.post('/auth/refresh');
};

export const googleLogin = (code) => {
    return api.post('/auth/google', { code });
};

// Đăng xuất
export const logout = () => {
  return api.post('/auth/logout');
};

export default api;