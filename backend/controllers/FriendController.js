const Friendship = require('../models/Friendship');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

const SortUser = (User1, User2) => {
    return String(User1) < String(User2)
        ? { User1, User2 }
        : { User1: User2, User2: User1 };
};

const FriendController = {
    // 1. Gửi lời mời kết bạn
    sendFriendRequest: async (req, res) => {
        const From = req.user.id;
        const { To } = req.body;

        if (String(From) === String(To))
            return res.status(400).json({ message: 'Không thể kết bạn với chính mình' });

        try {
            const existedRequest = await FriendRequest.findOne({ From, To });
            if (existedRequest)
                return res.status(400).json({ message: 'Bạn đã gửi lời mời trước đó' });

            const existedFriendship = await Friendship.findOne(SortUser(From, To));
            if (existedFriendship)
                return res.status(400).json({ message: 'Bạn đã là bạn bè' });

            const newRequest = await FriendRequest.create({ From, To });
            return res.status(200).json(newRequest);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // 2. Chấp nhận lời mời
    acceptFriendRequest: async (req, res) => {
        const To = req.user.id;
        const { From } = req.body;

        try {
            const request = await FriendRequest.findOneAndUpdate(
                { From, To, Status: 'pending' },
                { Status: 'accepted' },
                { new: true }
            );
            if (!request) return res.status(404).json({ message: 'Không tìm thấy lời mời' });

            const { User1, User2 } = SortUser(From, To);
            await Friendship.create({ User1, User2 });

            // Cập nhật vào mảng Friends của cả hai user
            await Promise.all([
                User.findByIdAndUpdate(From, { $addToSet: { Friends: To } }),
                User.findByIdAndUpdate(To, { $addToSet: { Friends: From } }),
            ]);

            return res.status(200).json({ message: 'Đã chấp nhận lời mời' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // 3. Từ chối lời mời
    rejectFriendRequest: async (req, res) => {
        const To = req.user.id;
        const { From } = req.body;

        try {
            const request = await FriendRequest.findOneAndUpdate(
                { From, To, Status: 'pending' },
                { Status: 'rejected' },
                { new: true }
            );
            if (!request) return res.status(404).json({ message: 'Không tìm thấy lời mời' });

            return res.status(200).json({ message: 'Đã từ chối lời mời' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // 4. Hủy lời mời đã gửi
    cancelFriendRequest: async (req, res) => {
        const From = req.user.id;
        const { To } = req.body;

        try {
            const deleted = await FriendRequest.findOneAndDelete({ From, To, Status: 'pending' });
            if (!deleted) return res.status(404).json({ message: 'Không có lời mời để hủy' });

            return res.status(200).json({ message: 'Đã hủy lời mời' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // 5. Hủy kết bạn
    unfriend: async (req, res) => {
        const userA = req.user.id;
        const { userB } = req.body;

        try {
            const deleted = await Friendship.findOneAndDelete(SortUser(userA, userB));
            if (!deleted) return res.status(404).json({ message: 'Hai người không phải bạn bè' });

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

            return res.status(200).json({ message: 'Đã hủy kết bạn và xóa lời mời liên quan' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // 6. Lấy danh sách bạn bè
    getFriends: async (req, res) => {
        const userId = req.user.id;

        try {
            const user = await User.findById(userId).populate('Friends', 'Name Avatar');
            return res.status(200).json(user.Friends);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // 7. Xem lời mời đã gửi
    getSentRequests: async (req, res) => {
        const userId = req.user.id;

        try {
            const sentRequests = await FriendRequest.find({ From: userId, Status: 'pending' }).populate('To', 'Name Avatar');
            return res.status(200).json(sentRequests);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // 8. Xem lời mời nhận được
    getReceivedRequests: async (req, res) => {
        const userId = req.user.id;

        try {
            const receivedRequests = await FriendRequest.find({ To: userId, Status: 'pending' }).populate('From', 'Name Avatar');
            return res.status(200).json(receivedRequests);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // 9. Gợi ý bạn bè dựa trên bạn chung
    suggestFriends: async (req, res) => {
        const userId = req.user.id;

        try {
            const user = await User.findById(userId).populate('Friends', '_id');
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
                fUser.Friends.forEach(fofId => {
                    const idStr = String(fofId);
                    if (!interactedIds.has(idStr)) {
                        mutualCounts.set(idStr, (mutualCounts.get(idStr) || 0) + 1);
                    }
                });
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
            return res.status(500).json({ message: error.message });
        }
    },
};

module.exports = FriendController;