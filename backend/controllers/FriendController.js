const Friendship = require('../models/Friendship');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const { createNotification } = require('./NotificationController');
const mongoose = require('mongoose');

// Helper function to get socket.io instance
const getSocketIO = (req) => {
    return req.app.get('socketio');
};

const SortUser = (User1, User2) => {
    return String(User1) < String(User2)
        ? { User1, User2 }
        : { User1: User2, User2: User1 };
};

const FriendController = {
    // 1. Gửi lời mời kết bạn
    sendFriendRequest: async (req, res) => {
        try {
            const From = req.user.id;
            const { To } = req.body;

            // Validate required field
            if (!To) {
                return res.status(400).json({ message: 'To field is required' });
            }

            // Validate To ID format
            if (!mongoose.Types.ObjectId.isValid(To)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            // Check if trying to friend yourself
            if (String(From) === String(To)) {
                return res.status(400).json({ message: 'Cannot send friend request to yourself' });
            }

            // Check if target user exists
            const targetUser = await User.findById(To);
            if (!targetUser) {
                return res.status(404).json({ message: 'Target user not found' });
            }

            // Check if request already exists
            const existedRequest = await FriendRequest.findOne({ From, To });
            if (existedRequest) {
                return res.status(400).json({ message: 'Friend request already sent' });
            }

            // Check if already friends
            const existedFriendship = await Friendship.findOne(SortUser(From, To));
            if (existedFriendship) {
                return res.status(400).json({ message: 'Already friends with this user' });
            }

            const newRequest = await FriendRequest.create({ From, To });

            // Tạo thông báo cho người nhận
            const notification = await createNotification(
                To,
                From,
                'friend_request',
                { friendRequestId: newRequest._id }
            );

            // Gửi thông báo real-time qua socket
            const io = getSocketIO(req);
            if (io && notification) {
                io.to(`user:${To}`).emit('new_notification', notification);
            }

            return res.status(200).json({ message: 'Friend request sent successfully', request: newRequest });
        } catch (error) {
            console.error('sendFriendRequest error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // 2. Chấp nhận lời mời
    acceptFriendRequest: async (req, res) => {
        try {
            const To = req.user.id;
            const { From } = req.body;

            // Validate required field
            if (!From) {
                return res.status(400).json({ message: 'From field is required' });
            }

            // Validate From ID format
            if (!mongoose.Types.ObjectId.isValid(From)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            // Check if user exists
            const fromUser = await User.findById(From);
            if (!fromUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            const request = await FriendRequest.findOneAndUpdate(
                { From, To, Status: 'pending' },
                { Status: 'accepted' },
                { new: true }
            );
            if (!request) {
                return res.status(404).json({ message: 'Friend request not found or already processed' });
            }

            const { User1, User2 } = SortUser(From, To);
            await Friendship.create({ User1, User2 });

            // Cập nhật vào mảng Friends của cả hai user
            await Promise.all([
                User.findByIdAndUpdate(From, { $addToSet: { Friends: To } }),
                User.findByIdAndUpdate(To, { $addToSet: { Friends: From } }),
            ]);

            // Tạo thông báo cho người gửi lời mời
            const notification = await createNotification(
                From,
                To,
                'friend_accepted',
                { friendRequestId: request._id }
            );

            // Gửi thông báo real-time qua socket
            const io = getSocketIO(req);
            if (io && notification) {
                io.to(`user:${From}`).emit('new_notification', notification);
            }

            return res.status(200).json({ message: 'Friend request accepted successfully' });
        } catch (error) {
            console.error('acceptFriendRequest error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // 3. Từ chối lời mời
    rejectFriendRequest: async (req, res) => {
        try {
            const To = req.user.id;
            const { From } = req.body;

            // Validate required field
            if (!From) {
                return res.status(400).json({ message: 'From field is required' });
            }

            // Validate From ID format
            if (!mongoose.Types.ObjectId.isValid(From)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            const request = await FriendRequest.findOneAndUpdate(
                { From, To, Status: 'pending' },
                { Status: 'rejected' },
                { new: true }
            );
            if (!request) {
                return res.status(404).json({ message: 'Friend request not found or already processed' });
            }

            return res.status(200).json({ message: 'Friend request rejected successfully' });
        } catch (error) {
            console.error('rejectFriendRequest error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // 4. Hủy lời mời đã gửi
    cancelFriendRequest: async (req, res) => {
        try {
            const From = req.user.id;
            const { To } = req.body;

            // Validate required field
            if (!To) {
                return res.status(400).json({ message: 'To field is required' });
            }

            // Validate To ID format
            if (!mongoose.Types.ObjectId.isValid(To)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            const deleted = await FriendRequest.findOneAndDelete({ From, To, Status: 'pending' });
            if (!deleted) {
                return res.status(404).json({ message: 'No pending friend request found to cancel' });
            }

            return res.status(200).json({ message: 'Friend request cancelled successfully' });
        } catch (error) {
            console.error('cancelFriendRequest error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // 5. Hủy kết bạn
    unfriend: async (req, res) => {
        try {
            const userA = req.user.id;
            const { userB } = req.body;

            // Validate required field
            if (!userB) {
                return res.status(400).json({ message: 'userB field is required' });
            }

            // Validate userB ID format
            if (!mongoose.Types.ObjectId.isValid(userB)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            // Check if trying to unfriend yourself
            if (String(userA) === String(userB)) {
                return res.status(400).json({ message: 'Cannot unfriend yourself' });
            }

            // Check if user exists
            const targetUser = await User.findById(userB);
            if (!targetUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            const deleted = await Friendship.findOneAndDelete(SortUser(userA, userB));
            if (!deleted) {
                return res.status(404).json({ message: 'Not friends with this user' });
            }

            // Cập nhật lại mảng Friends trong User
            await Promise.all([
                User.findByIdAndUpdate(userA, { $pull: { Friends: userB } }),
                User.findByIdAndUpdate(userB, { $pull: { Friends: userA } }),
            ]);

            // Xóa các lời mời kết bạn (pending, accepted, rejected) nếu có giữa 2 người (cả 2 chiều)
            await FriendRequest.deleteMany({
                $or: [
                    { From: userA, To: userB },
                    { From: userB, To: userA },
                ],
            });

            return res.status(200).json({ message: 'Unfriended successfully and related requests deleted' });
        } catch (error) {
            console.error('unfriend error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // 6. Lấy danh sách bạn bè
    getFriends: async (req, res) => {
        try {
            const userId = req.user.id;

            // Lấy tất cả friendships của user
            const friendships = await Friendship.find({
                $or: [
                    { User1: userId },
                    { User2: userId }
                ]
            }).populate('User1', 'Name Avatar Role').populate('User2', 'Name Avatar Role');

            // Lọc và map để lấy friend info cùng với createdAt
            const friends = friendships.map(friendship => {
                // Xác định friend là user còn lại (không phải current user)
                const friend = friendship.User1._id.toString() === userId 
                    ? friendship.User2 
                    : friendship.User1;
                
                // Chỉ trả về nếu friend không phải admin
                if (friend.Role === 'admin') {
                    return null;
                }

                return {
                    _id: friend._id,
                    Name: friend.Name,
                    Avatar: friend.Avatar,
                    createdAt: friendship.createdAt // Ngày tạo friendship
                };
            }).filter(Boolean); // Loại bỏ null

            return res.status(200).json(friends);
        } catch (error) {
            console.error('getFriends error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // 7. Xem lời mời đã gửi
    getSentRequests: async (req, res) => {
        try {
            const userId = req.user.id;

            const sentRequests = await FriendRequest.find({ From: userId, Status: 'pending' }).populate('To', 'Name Avatar');
            return res.status(200).json(sentRequests);
        } catch (error) {
            console.error('getSentRequests error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // 8. Xem lời mời nhận được
    getReceivedRequests: async (req, res) => {
        try {
            const userId = req.user.id;

            const receivedRequests = await FriendRequest.find({ To: userId, Status: 'pending' }).populate('From', 'Name Avatar');
            return res.status(200).json(receivedRequests);
        } catch (error) {
            console.error('getReceivedRequests error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // 9. Gợi ý bạn bè dựa trên bạn chung
    suggestFriends: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await User.findById(userId).populate({
                path: 'Friends',
                select: '_id Role',
                match: { Role: { $ne: 'admin' } }
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const friendIds = new Set(user.Friends.map(f => String(f._id)));
            const requests = await FriendRequest.find({
                $or: [{ From: userId }, { To: userId }]
            });

            const interactedIds = new Set([String(userId)]);
            requests.forEach((r) => {
                interactedIds.add(String(r.From));
                interactedIds.add(String(r.To));
            });
            friendIds.forEach(id => interactedIds.add(id));

            // Đếm bạn chung
            const mutualCounts = new Map();

            for (let friend of user.Friends) {
                const fUser = await User.findById(friend._id).select('Friends');
                if (fUser && fUser.Friends) {
                    fUser.Friends.forEach(fofId => {
                        const idStr = String(fofId);
                        if (!interactedIds.has(idStr)) {
                            mutualCounts.set(idStr, (mutualCounts.get(idStr) || 0) + 1);
                        }
                    });
                }
            }

            // Tìm user hợp lệ để gợi ý
            const suggestions = await User.find({
                _id: { $nin: Array.from(interactedIds) },
                Role: 'user',
            }).select('Name Avatar');

            const result = suggestions.map(user => ({
                _id: user._id,
                Name: user.Name,
                Avatar: user.Avatar,
                mutualFriends: mutualCounts.get(String(user._id)) || 0
            }));

            result.sort((a, b) => b.mutualFriends - a.mutualFriends);

            return res.status(200).json(result);
        } catch (error) {
            console.error('suggestFriends error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
};

module.exports = FriendController;