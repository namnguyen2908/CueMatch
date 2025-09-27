const User = require('../models/User'); // Adjust path as needed
const PlayerBio = require('../models/PlayerBio');
const MatchInvitation = require('../models/MatchInvitation');
const { DateTime } = require('luxon');
const sendInvitationEmail = require('../sendEmail');

// Helper function to calculate compatibility percentage between two PlayerBios
const calculateCompatibility = (myBio, otherBio, selectedPlayType) => {
    let score = 0;
    let maxScore = 100;

    if (myBio.Address.City === otherBio.Address.City) score += 15;
    if (myBio.Address.District === otherBio.Address.District) score += 15;
    if (myBio.Address.Ward === otherBio.Address.Ward) score += 10;

    const sameTimes = myBio.AvailableTimes.filter(time => otherBio.AvailableTimes.includes(time)).length;
    score += Math.min(sameTimes * 8, 15);

    const sameGoals = myBio.PlayGoals.filter(goal => otherBio.PlayGoals.includes(goal)).length;
    score += Math.min(sameGoals * 5, 15);

    const myPlay = myBio.PlayStyles.find(p => p.PlayType === selectedPlayType);
    const otherPlay = otherBio.PlayStyles.find(p => p.PlayType === selectedPlayType);
    if (myPlay && otherPlay) {
        const rankOrder = ['H', 'G', 'E', 'D', 'C', 'B', 'B+', 'A', 'A+'];
        const diff = Math.abs(rankOrder.indexOf(myPlay.Rank) - rankOrder.indexOf(otherPlay.Rank));
        if (diff === 0) score += 30;
        else if (diff === 1) score += 25;
        else if (diff === 2) score += 20;
        else if (diff === 3) score += 15;
    }

    return Math.round((score / maxScore) * 100);
};


const MatchingController = {
    getPlayerList: async (req, res) => {
        try {
            const userId = req.user.id;
            const { playType } = req.query;

            const myBio = await PlayerBio.findOne({ User: userId }).lean();
            if (!myBio) return res.status(404).json({ message: 'PlayerBio not found.' });

            const allBios = await PlayerBio.find({ User: { $ne: userId } }).populate('User').lean();

            const results = allBios
                .filter(bio => bio.PlayStyles.some(p => p.PlayType === playType))
                .map(bio => {
                    const compatibility = calculateCompatibility(myBio, bio, playType);
                    return {
                        user: {
                            id: bio.User._id,
                            name: bio.User.Name,
                            avatar: bio.User.Avatar
                        },
                        bio,
                        compatibility
                    };
                })
                .sort((a, b) => b.compatibility - a.compatibility);

            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    sendInvitation: async (req, res) => {
        try {
        const fromUser = req.user.id;
        const { toUser, location, matchDate, timeStart, timeEnd, playType, message } = req.body;

        const matchDateLuxon = DateTime.fromFormat(matchDate, 'yyyy-MM-dd', { zone: 'Asia/Ho_Chi_Minh' }).startOf('day');
        const today = DateTime.now().setZone('Asia/Ho_Chi_Minh').startOf('day');

        if (matchDateLuxon <= today) {
            return res.status(400).json({ message: 'Ngày thi đấu phải là một ngày trong tương lai.' });
        }

        const matchDateObj = matchDateLuxon.toJSDate();

        const conflict = await MatchInvitation.findOne({
            To: toUser,
            MatchDate: matchDateObj,
            Status: { $in: ['Accepted', 'Pending'] },
            $or: [
                { TimeStart: { $lt: timeEnd }, TimeEnd: { $gt: timeStart } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ message: 'Người này đã có lịch trong khoảng thời gian này.' });
        }

        const invitation = await MatchInvitation.create({
            From: fromUser,
            To: toUser,
            Location: location,
            MatchDate: matchDateObj,
            TimeStart: timeStart,
            TimeEnd: timeEnd,
            PlayType: playType,
            Message: message
        });

        // --- GỬI EMAIL ---
        const fromUserData = await User.findById(fromUser);
        const toUserData = await User.findById(toUser);

        await sendInvitationEmail({
            toEmail: toUserData.Email,
            toName: toUserData.Name,
            fromName: fromUserData.Name,
            matchDate,
            timeStart,
            timeEnd,
            location,
            playType,
            message
        });

        const formattedInvitation = {
            ...invitation.toObject(),
            MatchDate: DateTime.fromJSDate(invitation.MatchDate, { zone: 'Asia/Ho_Chi_Minh' }).toFormat('yyyy-MM-dd')
        };

        res.status(201).json(formattedInvitation);
    } catch (err) {
        console.error('Lỗi trong sendInvitation:', err.message, err.stack);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
    },


    acceptInvitation: async (req, res) => {
        try {
            const userId = req.user.id;
            const { invitationId } = req.params;

            const invitation = await MatchInvitation.findById(invitationId);
            if (!invitation || invitation.To.toString() !== userId) {
                return res.status(403).json({ message: 'Không có quyền thực hiện.' });
            }

            // Cập nhật lời mời này thành Accepted
            invitation.Status = 'Accepted';
            await invitation.save();

            // Hủy các lời mời khác bị trùng giờ
            await MatchInvitation.updateMany({
                _id: { $ne: invitationId },
                To: userId,
                MatchDate: invitation.MatchDate,
                Status: 'Pending',
                TimeStart: { $lt: invitation.TimeEnd },
                TimeEnd: { $gt: invitation.TimeStart }
            }, {
                $set: { Status: 'Cancelled' }
            });

            res.json({ message: 'Đã chấp nhận lời mời và hủy các lời mời trùng thời gian.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getInvitations: async (req, res) => {
        try {
            const userId = req.user.id;

            // Lấy tất cả lời mời mà user nhận được
            const invitations = await MatchInvitation.find({ To: userId, Status: 'Pending' })
                .populate('From', 'Name Avatar') // Lấy thông tin người gửi
                .sort({ createdAt: -1 }); // Mới nhất lên trước

            res.json(invitations);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    declineInvitation: async (req, res) => {
        try {
            const userId = req.user.id;
            const { invitationId } = req.params;

            const invitation = await MatchInvitation.findById(invitationId);
            if (!invitation || invitation.To.toString() !== userId) {
                return res.status(403).json({ message: 'Không có quyền thực hiện.' });
            }

            invitation.Status = 'Declined';
            await invitation.save();

            res.json({ message: 'Đã từ chối lời mời.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getSentInvitation: async (req, res) => {
        try {
            const userId = req.user.id;

            // Tìm các lời mời user đã gửi đi
            const invitations = await MatchInvitation.find({ From: userId })
                .populate('To', 'Name Avatar') // Lấy thông tin người được mời
                .sort({ createdAt: -1 }); // Mới nhất lên trước

            res.json(invitations);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    cancelInvitation: async (req, res) => {
        try {
            const userId = req.user.id;
            const { invitationId } = req.params;

            const invitation = await MatchInvitation.findById(invitationId);

            if (!invitation || invitation.From.toString() !== userId) {
                return res.status(403).json({ message: 'Không có quyền hủy lời mời này.' });
            }

            if (invitation.Status !== 'Pending') {
                return res.status(400).json({ message: 'Không thể hủy lời mời đã được xử lý.' });
            }

            invitation.Status = 'Cancelled';
            await invitation.save();

            res.json({ message: 'Đã hủy lời mời thành công.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getMatchHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const { status } = req.query;

            // Validate trạng thái được truyền (có thể mở rộng nếu cần)
            const allowedStatuses = ['Occurred', 'Declined', 'Cancelled'];
            if (!status || !allowedStatuses.includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }

            // Tìm các lời mời mà user là người gửi hoặc người nhận và có status phù hợp
            const matches = await MatchInvitation.find({
                Status: status,
                $or: [
                    { From: userId },
                    { To: userId }
                ]
            })
                .populate('From', 'Name Avatar')
                .populate('To', 'Name Avatar')
                .sort({ MatchDate: -1 });

            res.json(matches);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Lỗi server khi lấy lịch sử đấu.' });
        }
    },

    getUpcomingMatches: async (req, res) => {
        try {
            const userId = req.user.id;

            const today = DateTime.now().setZone('Asia/Ho_Chi_Minh').startOf('day').toJSDate();

            const matches = await MatchInvitation.find({
                Status: 'Accepted',
                MatchDate: { $gte: today },
                $or: [
                    { From: userId },
                    { To: userId }
                ]
            })
                .populate('From', 'Name Avatar')
                .populate('To', 'Name Avatar')
                .sort({ MatchDate: 1, TimeStart: 1 });

            res.json(matches);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách trận đấu sắp diễn ra:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách trận sắp tới.' });
        }
    },

};

module.exports = MatchingController;