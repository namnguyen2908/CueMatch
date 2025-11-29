import api from './api';

const notificationApi = {
    // Lấy tất cả thông báo
    getNotifications: (limit = 50, skip = 0) => {
        return api.get('/notifications', {
            params: { limit, skip }
        });
    },

    // Lấy số lượng thông báo chưa đọc
    getUnreadCount: () => {
        return api.get('/notifications/unread-count');
    },

    // Đánh dấu thông báo là đã đọc
    markAsRead: (notificationId) => {
        return api.put(`/notifications/${notificationId}/read`);
    },

    // Đánh dấu tất cả thông báo là đã đọc
    markAllAsRead: () => {
        return api.put('/notifications/read-all');
    },

    // Xóa thông báo
    deleteNotification: (notificationId) => {
        return api.delete(`/notifications/${notificationId}`);
    },
};

export default notificationApi;

