const Notification = require('../models/Notification');
const User = require('../models/User');

const NotificationController = {
    // Lấy tất cả thông báo của user
    getNotifications: async (req, res) => {
        try {
            const userId = req.user.id;
            const { limit = 50, skip = 0 } = req.query;

            const notifications = await Notification.find({ UserID: userId })
                .populate('FromUserID', 'Name Avatar')
                .populate('PostID', 'Content Image')
                .populate('CommentID', 'Content')
                .populate('FriendRequestID')
                .populate('MatchInvitationID')
                .populate({
                    path: 'BookingID',
                    select: 'BookingDate StartHour EndHour Status Table Club',
                    populate: [
                        { path: 'Table', select: 'TableNumber Type' },
                        { path: 'Club', select: 'Name' }
                    ]
                })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(skip))
                .lean();

            res.json(notifications);
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lấy số lượng thông báo chưa đọc
    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user.id;
            const count = await Notification.countDocuments({ UserID: userId, IsRead: false });
            res.json({ count });
        } catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Đánh dấu thông báo là đã đọc
    markAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            const { notificationId } = req.params;

            const notification = await Notification.findOne({ _id: notificationId, UserID: userId });
            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
            }

            notification.IsRead = true;
            await notification.save();

            res.json({ message: 'Notification marked as read', notification });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Đánh dấu tất cả thông báo là đã đọc
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            await Notification.updateMany({ UserID: userId, IsRead: false }, { IsRead: true });
            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Xóa thông báo
    deleteNotification: async (req, res) => {
        try {
            const userId = req.user.id;
            const { notificationId } = req.params;

            const notification = await Notification.findOneAndDelete({ _id: notificationId, UserID: userId });
            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
            }

            res.json({ message: 'Notification deleted' });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
};

// Helper function để tạo thông báo
const createNotification = async (userId, fromUserId, type, options = {}) => {
    try {
        // Không tạo thông báo nếu user tự tương tác với chính mình
        if (String(userId) === String(fromUserId)) {
            return null;
        }

        const { postId, commentId, friendRequestId, matchInvitationId, bookingId, message } = options;

        // Tạo message mặc định nếu không có
        let notificationMessage = message;
        if (!notificationMessage) {
            const fromUser = await User.findById(fromUserId).select('Name');
            const userName = fromUser?.Name || 'Someone';

            switch (type) {
                case 'like':
                    notificationMessage = `${userName} liked your post`;
                    break;
                case 'comment':
                    notificationMessage = `${userName} commented on your post`;
                    break;
                case 'friend_request':
                    notificationMessage = `${userName} sent you a friend request`;
                    break;
                case 'friend_accepted':
                    notificationMessage = `${userName} accepted your friend request`;
                    break;
                case 'matching_request':
                    notificationMessage = `${userName} sent you a matching invitation`;
                    break;
                case 'matching_accepted':
                    notificationMessage = `${userName} accepted your matching invitation`;
                    break;
                case 'new_booking':
                    notificationMessage = `${userName} made a booking at your club`;
                    break;
                default:
                    notificationMessage = 'You have a new notification';
            }
        }

        const notification = await Notification.create({
            UserID: userId,
            FromUserID: fromUserId,
            Type: type,
            PostID: postId || null,
            CommentID: commentId || null,
            FriendRequestID: friendRequestId || null,
            MatchInvitationID: matchInvitationId || null,
            BookingID: bookingId || null,
            Message: notificationMessage,
        });

        // Populate để trả về đầy đủ thông tin
        await notification.populate('FromUserID', 'Name Avatar');
        if (postId) await notification.populate('PostID', 'Content Image');
        if (commentId) await notification.populate('CommentID', 'Content');
        if (bookingId) {
            await notification.populate({
                path: 'BookingID',
                select: 'BookingDate StartHour EndHour Status Table Club',
                populate: [
                    { path: 'Table', select: 'TableNumber Type' },
                    { path: 'Club', select: 'Name' }
                ]
            });
        }

        // Convert to plain object for socket emission
        return notification.toObject ? notification.toObject() : notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

module.exports = { NotificationController, createNotification };

