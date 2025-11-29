
import api from './api'; // Assuming you have a base API instance

export const register = (user) => {
    return api.post('/auth/register', user);
};

export const login = (user) => {
    return api.post('/auth/login', user);
};

export const googleLogin = (code) => {
    return api.post('/auth/google', { code });
};

// Đăng xuất
export const logout = () => {
  return api.post('/auth/logout');
};

export const requestPasswordOtp = (Email) => {
    return api.post('/auth/forgot-password', { Email });
};

export const resetPassword = ({ Email, otp, Password }) => {
    return api.post('/auth/reset-password', { Email, otp, Password });
};

// Kiểm tra xem user đã đăng nhập chưa (token còn hạn)
export const checkAuth = () => {
    return api.get('/auth/check');
};

export default api;