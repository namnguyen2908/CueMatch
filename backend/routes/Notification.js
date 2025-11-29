const express = require('express');
const router = express.Router();
const { NotificationController } = require('../controllers/NotificationController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tất cả routes đều cần authentication
router.get('/', verifyToken, NotificationController.getNotifications);
router.get('/unread-count', verifyToken, NotificationController.getUnreadCount);
router.put('/:notificationId/read', verifyToken, NotificationController.markAsRead);
router.put('/read-all', verifyToken, NotificationController.markAllAsRead);
router.delete('/:notificationId', verifyToken, NotificationController.deleteNotification);

module.exports = router;

