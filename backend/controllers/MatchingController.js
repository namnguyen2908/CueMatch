const User = require('../models/User'); // Adjust path as needed
const PlayerBio = require('../models/PlayerBio');
const MatchInvitation = require('../models/MatchInvitation');
const { DateTime } = require('luxon');
const { sendInvitationEmail } = require('../sendEmail');
const BilliardsClub = require('../models/BilliardsClub');
const { createNotification } = require('./NotificationController');
const mongoose = require('mongoose');
const redisClient = require('../redisClient');

// Helper function to get socket.io instance
const getSocketIO = (req) => {
    return req.app.get('socketio');
};


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
            if (!playType) {
                return res.status(400).json({ message: 'playType is required' });
            }
            const validPlayTypes = ['Pool', 'Carom', 'Snooker'];
            if (!validPlayTypes.includes(playType)) {
                return res.status(400).json({ message: `Invalid playType. Must be one of: ${validPlayTypes.join(', ')}` });
            }
            const myBio = await PlayerBio.findOne({ User: userId }).lean();
            if (!myBio) {
                return res.status(404).json({ message: 'PlayerBio not found' });
            }
            const allBios = await PlayerBio.find({ User: { $ne: userId } }).populate('User').lean();
            const userIds = allBios
                .filter(bio => bio.PlayStyles && bio.PlayStyles.some(p => p.PlayType === playType))
                .map(bio => bio.User._id.toString());
            const onlineStatusMap = {};
            if (userIds.length > 0) {
                const onlineChecks = await Promise.all(
                    userIds.map(async (userId) => {
                        const isOnline = await redisClient.get(`online:${userId}`);
                        return { userId, isOnline: isOnline === 'true' };
                    })
                );
                onlineChecks.forEach(({ userId, isOnline }) => {
                    onlineStatusMap[userId] = isOnline;
                });
            }
            const results = allBios
                .filter(bio => bio.PlayStyles && bio.PlayStyles.some(p => p.PlayType === playType))
                .map(bio => {
                    const compatibility = calculateCompatibility(myBio, bio, playType);
                    const userId = bio.User._id.toString();
                    return {
                        user: {
                            id: bio.User._id,
                            name: bio.User.Name,
                            avatar: bio.User.Avatar,
                            isOnline: onlineStatusMap[userId] || false
                        },
                        bio,
                        compatibility
                    };
                })
                .sort((a, b) => b.compatibility - a.compatibility);
            res.json(results);
        } catch (err) {
            console.error('getPlayerList error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    sendInvitation: async (req, res) => {
        try {
            const fromUser = req.user.id;
            const { toUser, location, matchDate, timeStart, timeEnd, playType, message } = req.body;

            // Validate required fields
            if (!toUser || !location || !matchDate || !timeStart || !timeEnd || !playType) {
                return res.status(400).json({
                    message: 'Missing required fields: toUser, location, matchDate, timeStart, timeEnd, playType'
                });
            }

            // Validate toUser ID format
            if (!mongoose.Types.ObjectId.isValid(toUser)) {
                return res.status(400).json({ message: 'Invalid toUser ID format' });
            }

            // Check if trying to invite yourself
            if (String(fromUser) === String(toUser)) {
                return res.status(400).json({ message: 'Cannot send invitation to yourself' });
            }

            // Check if target user exists
            const targetUser = await User.findById(toUser);
            if (!targetUser) {
                return res.status(404).json({ message: 'Target user not found' });
            }

            // Validate location
            if (!location.trim()) {
                return res.status(400).json({ message: 'Location cannot be empty' });
            }
            if (location.length > 200) {
                return res.status(400).json({ message: 'Location must not exceed 200 characters' });
            }

            // Validate date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(matchDate)) {
                return res.status(400).json({ message: 'Invalid date format. Expected YYYY-MM-DD' });
            }

            // Validate date is not in the past
            let matchDateLuxon;
            try {
                matchDateLuxon = DateTime.fromFormat(matchDate, 'yyyy-MM-dd', { zone: 'Asia/Ho_Chi_Minh' }).startOf('day');
            } catch (err) {
                return res.status(400).json({ message: 'Invalid date format. Expected YYYY-MM-DD' });
            }

            const today = DateTime.now().setZone('Asia/Ho_Chi_Minh').startOf('day');
            if (matchDateLuxon <= today) {
                return res.status(400).json({ message: 'Match date must be in the future' });
            }

            // Validate time format (HH:MM)
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(timeStart)) {
                return res.status(400).json({ message: 'Invalid timeStart format. Expected HH:MM (24-hour format)' });
            }
            if (!timeRegex.test(timeEnd)) {
                return res.status(400).json({ message: 'Invalid timeEnd format. Expected HH:MM (24-hour format)' });
            }

            // Validate timeStart < timeEnd
            const [startHour, startMin] = timeStart.split(':').map(Number);
            const [endHour, endMin] = timeEnd.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            if (startMinutes >= endMinutes) {
                return res.status(400).json({ message: 'timeStart must be earlier than timeEnd' });
            }

            // Validate playType
            const validPlayTypes = ['Pool', 'Carom', 'Snooker'];
            if (!validPlayTypes.includes(playType)) {
                return res.status(400).json({ message: `Invalid playType. Must be one of: ${validPlayTypes.join(', ')}` });
            }

            // Validate message length if provided
            if (message && message.length > 500) {
                return res.status(400).json({ message: 'Message must not exceed 500 characters' });
            }

            const matchDateObj = matchDateLuxon.toJSDate();

            // Check for time conflicts
            const conflict = await MatchInvitation.findOne({
                To: toUser,
                MatchDate: matchDateObj,
                Status: { $in: ['Accepted', 'Pending'] },
                $or: [
                    { TimeStart: { $lt: timeEnd }, TimeEnd: { $gt: timeStart } }
                ]
            });

            if (conflict) {
                return res.status(400).json({ message: 'User already has a match scheduled during this time' });
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

            // Populate invitation data for socket emission
            const populatedInvitation = await MatchInvitation.findById(invitation._id)
                .populate('From', 'Name Avatar')
                .populate('To', 'Name Avatar')
                .lean();

            const formattedInvitation = {
                ...populatedInvitation,
                MatchDate: DateTime.fromJSDate(invitation.MatchDate, { zone: 'Asia/Ho_Chi_Minh' }).toFormat('yyyy-MM-dd')
            };

            // Tạo thông báo cho người nhận
            const notification = await createNotification(
                toUser,
                fromUser,
                'matching_request',
                { matchInvitationId: invitation._id }
            );

            // Emit socket event to notify the recipient
            const io = getSocketIO(req);
            if (io) {
                io.to(`matching:${toUser}`).emit('new_invitation', formattedInvitation);
                // Also notify sender that invitation was sent successfully
                io.to(`matching:${fromUser}`).emit('invitation_sent', formattedInvitation);
                
                // Gửi thông báo real-time
                if (notification) {
                    io.to(`user:${toUser}`).emit('new_notification', notification);
                }
            }

            res.status(201).json({ message: 'Invitation sent successfully', invitation: formattedInvitation });
        } catch (err) {
            console.error('sendInvitation error:', err.message, err.stack);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },


    acceptInvitation: async (req, res) => {
        try {
            const userId = req.user.id;
            const { invitationId } = req.params;

            // Validate invitationId format
            if (!invitationId || !mongoose.Types.ObjectId.isValid(invitationId)) {
                return res.status(400).json({ message: 'Invalid invitation ID format' });
            }

            const invitation = await MatchInvitation.findById(invitationId);
            if (!invitation) {
                return res.status(404).json({ message: 'Invitation not found' });
            }

            if (invitation.To.toString() !== userId) {
                return res.status(403).json({ message: 'You do not have permission to accept this invitation' });
            }

            if (invitation.Status !== 'Pending') {
                return res.status(400).json({ message: 'Invitation is not in pending status' });
            }

            // Cập nhật lời mời này thành Accepted
            invitation.Status = 'Accepted';
            await invitation.save();

            // Hủy các lời mời khác bị trùng giờ
            const cancelledInvitations = await MatchInvitation.find({
                _id: { $ne: invitationId },
                To: userId,
                MatchDate: invitation.MatchDate,
                Status: 'Pending',
                TimeStart: { $lt: invitation.TimeEnd },
                TimeEnd: { $gt: invitation.TimeStart }
            });

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

            // Populate invitation data
            const populatedInvitation = await MatchInvitation.findById(invitationId)
                .populate('From', 'Name Avatar')
                .populate('To', 'Name Avatar')
                .lean();

            const formattedInvitation = {
                ...populatedInvitation,
                MatchDate: DateTime.fromJSDate(invitation.MatchDate, { zone: 'Asia/Ho_Chi_Minh' }).toFormat('yyyy-MM-dd')
            };

            // Tạo thông báo cho người gửi lời mời
            const notification = await createNotification(
                invitation.From.toString(),
                invitation.To.toString(),
                'matching_accepted',
                { matchInvitationId: invitationId }
            );

            // Emit socket events
            const io = getSocketIO(req);
            if (io) {
                // Notify both users about the accepted invitation
                io.to(`matching:${invitation.From.toString()}`).emit('invitation_accepted', formattedInvitation);
                io.to(`matching:${invitation.To.toString()}`).emit('invitation_accepted', formattedInvitation);
                
                // Gửi thông báo real-time
                if (notification) {
                    io.to(`user:${invitation.From.toString()}`).emit('new_notification', notification);
                }

                // Notify about cancelled invitations
                for (const cancelled of cancelledInvitations) {
                    const cancelledFormatted = {
                        ...cancelled.toObject(),
                        Status: 'Cancelled',
                        MatchDate: DateTime.fromJSDate(cancelled.MatchDate, { zone: 'Asia/Ho_Chi_Minh' }).toFormat('yyyy-MM-dd')
                    };
                    io.to(`matching:${cancelled.From.toString()}`).emit('invitation_cancelled', cancelledFormatted);
                    io.to(`matching:${cancelled.To.toString()}`).emit('invitation_cancelled', cancelledFormatted);
                }
            }

            res.json({ message: 'Invitation accepted successfully and conflicting invitations cancelled' });
        } catch (err) {
            console.error('acceptInvitation error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    getInvitations: async (req, res) => {
        try {
            const userId = req.user.id;

            // Lấy tất cả lời mời mà user nhận được
            const invitations = await MatchInvitation.find({ To: userId, Status: 'Pending' })
                .populate('From', 'Name Avatar')
                .sort({ createdAt: -1 });

            res.json(invitations);
        } catch (err) {
            console.error('getInvitations error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    declineInvitation: async (req, res) => {
        try {
            const userId = req.user.id;
            const { invitationId } = req.params;

            // Validate invitationId format
            if (!invitationId || !mongoose.Types.ObjectId.isValid(invitationId)) {
                return res.status(400).json({ message: 'Invalid invitation ID format' });
            }

            const invitation = await MatchInvitation.findById(invitationId);
            if (!invitation) {
                return res.status(404).json({ message: 'Invitation not found' });
            }

            if (invitation.To.toString() !== userId) {
                return res.status(403).json({ message: 'You do not have permission to decline this invitation' });
            }

            if (invitation.Status !== 'Pending') {
                return res.status(400).json({ message: 'Invitation is not in pending status' });
            }

            invitation.Status = 'Declined';
            await invitation.save();

            // Populate invitation data
            const populatedInvitation = await MatchInvitation.findById(invitationId)
                .populate('From', 'Name Avatar')
                .populate('To', 'Name Avatar')
                .lean();

            const formattedInvitation = {
                ...populatedInvitation,
                MatchDate: DateTime.fromJSDate(invitation.MatchDate, { zone: 'Asia/Ho_Chi_Minh' }).toFormat('yyyy-MM-dd')
            };

            // Emit socket events
            const io = getSocketIO(req);
            if (io) {
                // Notify both users about the declined invitation
                io.to(`matching:${invitation.From.toString()}`).emit('invitation_declined', formattedInvitation);
                io.to(`matching:${invitation.To.toString()}`).emit('invitation_declined', formattedInvitation);
            }

            res.json({ message: 'Invitation declined successfully' });
        } catch (err) {
            console.error('declineInvitation error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    getSentInvitation: async (req, res) => {
        try {
            const userId = req.user.id;

            // Tìm các lời mời user đã gửi đi
            const invitations = await MatchInvitation.find({ From: userId })
                .populate('To', 'Name Avatar')
                .sort({ createdAt: -1 });

            res.json(invitations);
        } catch (err) {
            console.error('getSentInvitation error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    cancelInvitation: async (req, res) => {
        try {
            const userId = req.user.id;
            const { invitationId } = req.params;

            // Validate invitationId format
            if (!invitationId || !mongoose.Types.ObjectId.isValid(invitationId)) {
                return res.status(400).json({ message: 'Invalid invitation ID format' });
            }

            const invitation = await MatchInvitation.findById(invitationId);
            if (!invitation) {
                return res.status(404).json({ message: 'Invitation not found' });
            }

            if (invitation.From.toString() !== userId) {
                return res.status(403).json({ message: 'You do not have permission to cancel this invitation' });
            }

            if (invitation.Status !== 'Pending') {
                return res.status(400).json({ message: 'Cannot cancel an invitation that has already been processed' });
            }

            invitation.Status = 'Cancelled';
            await invitation.save();

            // Populate invitation data
            const populatedInvitation = await MatchInvitation.findById(invitationId)
                .populate('From', 'Name Avatar')
                .populate('To', 'Name Avatar')
                .lean();

            const formattedInvitation = {
                ...populatedInvitation,
                MatchDate: DateTime.fromJSDate(invitation.MatchDate, { zone: 'Asia/Ho_Chi_Minh' }).toFormat('yyyy-MM-dd')
            };

            // Emit socket events
            const io = getSocketIO(req);
            if (io) {
                // Notify both users about the cancelled invitation
                io.to(`matching:${invitation.From.toString()}`).emit('invitation_cancelled', formattedInvitation);
                io.to(`matching:${invitation.To.toString()}`).emit('invitation_cancelled', formattedInvitation);
            }

            res.json({ message: 'Invitation cancelled successfully' });
        } catch (err) {
            console.error('cancelInvitation error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    getMatchHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const { status } = req.query;

            // Validate status
            if (!status) {
                return res.status(400).json({ message: 'Status is required' });
            }

            const allowedStatuses = ['Occurred', 'Declined', 'Cancelled'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
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
            console.error('getMatchHistory error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
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
            console.error('getUpcomingMatches error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    getNearbyClub: async (req, res) => {
        try {
            const { lat, lng, radius } = req.query;
            const clubs = await BilliardsClub.find({ IsActive: true }).lean();
            if (!lat || !lng) {
                return res.json(clubs);
            }
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            if (isNaN(userLat) || userLat < -90 || userLat > 90) {
                return res.status(400).json({ message: 'Invalid latitude. Must be a number between -90 and 90' });
            }
            if (isNaN(userLng) || userLng < -180 || userLng > 180) {
                return res.status(400).json({ message: 'Invalid longitude. Must be a number between -180 and 180' });
            }
            if (radius !== undefined) {
                const radiusNum = parseFloat(radius);
                if (isNaN(radiusNum) || radiusNum < 0) {
                    return res.status(400).json({ message: 'Invalid radius. Must be a non-negative number' });
                }
            }
            const R = 6371; 
            const withDistance = clubs
                .filter(c => c.Location?.lat && c.Location?.lng)
                .map((club) => {
                    const dLat = ((club.Location.lat - userLat) * Math.PI) / 180;
                    const dLng = ((club.Location.lng - userLng) * Math.PI) / 180;
                    const a =
                        Math.sin(dLat / 2) ** 2 +
                        Math.cos((userLat * Math.PI) / 180) *
                        Math.cos((club.Location.lat * Math.PI) / 180) *
                        Math.sin(dLng / 2) ** 2;
                    const distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    return { ...club, distance: parseFloat(distance.toFixed(2)) };
                });

            const radiusNum = radius ? parseFloat(radius) : 0;
            const result = radiusNum > 0
                ? withDistance.filter(c => c.distance <= radiusNum)
                : withDistance;

            result.sort((a, b) => a.distance - b.distance);
            res.json(result);
        } catch (err) {
            console.error("getNearbyClub error:", err);
            res.status(500).json({ message: "Server error", error: err.message });
        }
    },


};

module.exports = MatchingController;