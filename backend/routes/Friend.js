const express = require('express');
const router = express.Router();
const FriendController = require('../controllers/FriendController');
const verifyToken = require('../middlewares/authMiddleware');

// Gửi lời mời kết bạn
router.post('/send-request', verifyToken, FriendController.sendFriendRequest);

// Chấp nhận lời mời
router.post('/accept-request', verifyToken, FriendController.acceptFriendRequest);

// Từ chối lời mời
router.post('/reject-request', verifyToken, FriendController.rejectFriendRequest);

// Hủy lời mời đã gửi
router.post('/cancel-request', verifyToken, FriendController.cancelFriendRequest);

// Hủy kết bạn
router.post('/unfriend', verifyToken, FriendController.unfriend);

// Lấy danh sách bạn bè
router.get('/friends', verifyToken, FriendController.getFriends);

// Xem các lời mời đã gửi
router.get('/sent-requests', verifyToken, FriendController.getSentRequests);

// Xem các lời mời nhận được
router.get('/received-requests', verifyToken, FriendController.getReceivedRequests);

// Gợi ý kết bạn dựa trên bạn chung
router.get('/suggestions', verifyToken, FriendController.suggestFriends);

module.exports = router;