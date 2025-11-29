import axios from 'axios';
// import { refreshToken } from './authApi'; // Gọi lại chính API làm mới token

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

// Biến để tránh gọi refresh liên tục
let isRefreshing = false;
let failedQueue = [];
let isRedirecting = false; // Flag để tránh redirect nhiều lần

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor response để xử lý lỗi 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const skipRefreshPaths = ['/auth/login', '/auth/register', '/auth/google', '/auth/logout', '/auth/forgot-password', '/auth/reset-password'];
    const shouldSkipRefresh = originalRequest?._skipAuthRefresh || skipRefreshPaths.some(path => originalRequest?.url?.includes(path));
    
    // Bỏ qua nếu là request refresh token (để tránh vòng lặp vô hạn)
    if (originalRequest?.url?.includes('/auth/refresh') || shouldSkipRefresh) {
      console.log('🔄 Interceptor: This is a refresh token request, skipping interceptor');
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest)).catch((err) => {
          // Nếu retry cũng thất bại, reject
          return Promise.reject(err);
        });
      }

      isRefreshing = true;
      try {
        console.log('🔄 Interceptor: Attempting to refresh token...');
        // Gọi refresh token - request này cũng có thể bị interceptor xử lý nếu trả về 401
        // Nhưng vì isRefreshing = true, nó sẽ không retry lại
        const refreshResponse = await api.post('/auth/refresh', {}, {
          _skipAuthRefresh: true // Flag để tránh interceptor xử lý lại
        });
        console.log('✅ Interceptor: Token refreshed successfully', refreshResponse.status);
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Interceptor: Refresh token failed:', refreshError);
        console.error('❌ Interceptor: Refresh error response:', refreshError.response);
        console.error('❌ Interceptor: Refresh error status:', refreshError.response?.status);
        console.error('❌ Interceptor: Refresh error message:', refreshError.message);
        processQueue(refreshError, null);
        
        // Tạo error object với status 401 để đảm bảo ProtectedRoute có thể catch
        const finalError = refreshError.response?.status === 401 
          ? refreshError 
          : Object.assign(new Error('Refresh token failed'), { 
              response: { status: 401, data: { message: 'Unauthorized' } },
              config: refreshError.config 
            });
        
        if (!finalError.response) {
          finalError.response = { status: 401, data: { message: 'Unauthorized' } };
        }
        
        console.error('❌ Interceptor: Rejecting with error:', finalError);
        console.error('❌ Interceptor: Final error response:', finalError.response);
        isRefreshing = false;
        return Promise.reject(finalError);
      }
    }
    return Promise.reject(error);
  }
);



export default api;