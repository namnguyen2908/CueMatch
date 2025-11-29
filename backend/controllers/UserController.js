const User = require("../models/User");
const BilliardsClub = require("../models/BilliardsClub");
const Payment = require("../models/Payment");
const { queueDashboardUpdate } = require('../services/adminDashboardService');
const redisClient = require('../redisClient');

const UserController = {
    // Lấy thông tin user hiện tại (theo token)
    getUserDetail: async (req, res) => {
        try {
            const userId = req.params.userId || req.user.id; // Ưu tiên params, fallback token

            // Lấy user với Role để kiểm tra partner
            const user = await User.findById(userId).select("-Password -Provider -ProviderID");
            if (!user) return res.status(404).json({ message: "User not found" });

            // Nếu user là partner, tìm club và thêm clubId vào response
            let clubId = null;
            if (user.Role === 'partner') {
                console.log('🔍 UserController: Looking for club with Owner:', user._id);
                const club = await BilliardsClub.findOne({ Owner: user._id });
                console.log('🔍 UserController: Found club:', club ? { id: club._id, name: club.Name } : null);
                clubId = club ? String(club._id) : null;
                console.log('🔍 UserController: Returning clubId:', clubId);
            }

            // Convert user to plain object
            const userObject = user.toObject();
            
            // Loại bỏ Role khỏi response (như yêu cầu ban đầu)
            delete userObject.Role;
            
            // Thêm clubId nếu có
            if (clubId !== null) {
                userObject.clubId = clubId;
            }

            res.status(200).json(userObject);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const userId = req.user.id;
            const { Name, DateOfBirth } = req.body;

            let updatedData = {
                ...(Name && { Name }),
                ...(DateOfBirth && { DateOfBirth }),
            };

            // Nếu có file ảnh thì cập nhật Avatar
            if (req.file) {
                // Validate avatar file size (max 5MB)
                const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
                if (req.file.size && req.file.size > MAX_AVATAR_SIZE) {
                    return res.status(400).json({ 
                        message: 'Avatar image file size must be less than 5MB' 
                    });
                }
                updatedData.Avatar = req.file.path; // Cloudinary trả về đường dẫn tại file.path
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updatedData },
                { new: true, runValidators: true }
            );

            if (!updatedUser) return res.status(404).json({ message: "User not found" });

            res.status(200).json(updatedUser);
        } catch (error) {
            console.error("Update user error:", error);
            res.status(500).json({ message: error.message });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const { page = 1, limit = 20, search = "" } = req.query;

            const query = {
                Role: { $ne: 'admin' }, // Exclude admin users
                $or: [
                    { Name: { $regex: search, $options: "i" } },
                    { Email: { $regex: search, $options: "i" } }
                ]
            };

            const users = await User.find(query)
                .select("-Password -ProviderID")
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            const total = await User.countDocuments(query);

            res.status(200).json({
                data: users,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Xóa người dùng theo ID
    deleteUser: async (req, res) => {
        try {
            const { userId } = req.params;

            const deletedUser = await User.findByIdAndDelete(userId);
            if (!deletedUser) return res.status(404).json({ message: "User not found" });

            res.status(200).json({ message: "User deleted successfully" });
            queueDashboardUpdate(req.app);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // (Tùy chọn) Thống kê nhanh: tổng số user, admin, partner
    getUserStats: async (req, res) => {
        try {
            const stats = await User.aggregate([
                {
                    $group: {
                        _id: "$Role",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const result = {
                total: await User.countDocuments(),
                roles: stats.reduce((acc, cur) => {
                    acc[cur._id] = cur.count;
                    return acc;
                }, {})
            };

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getUserGrowth: async (req, res) => {
        try {
            const months = await User.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                {
                    $project: {
                        _id: 0,
                        month: "$_id",
                        count: 1
                    }
                }
            ]);
            res.status(200).json(months);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Heartbeat endpoint để renew TTL trong Redis
    heartbeat: async (req, res) => {
        try {
            const userId = req.user.id;
            
            // Set key với TTL 60 giây (key sẽ tự động expire nếu không có ping trong 60s)
            await redisClient.setEx(`online:${userId}`, 60, 'true');
            
            res.status(200).json({ message: 'Heartbeat received', online: true });
        } catch (error) {
            console.error('Heartbeat error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Get wallet balance
    getWalletBalance: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select('Wallet');
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Initialize wallet if not exists
            if (!user.Wallet) {
                user.Wallet = {
                    Balance: 0,
                    TotalEarned: 0,
                    TotalWithdrawn: 0
                };
                await user.save();
            }

            return res.json({
                balance: user.Wallet.Balance || 0,
                totalEarned: user.Wallet.TotalEarned || 0,
                totalWithdrawn: user.Wallet.TotalWithdrawn || 0
            });
        } catch (error) {
            console.error('Get wallet balance error:', error);
            return res.status(500).json({ message: 'Error fetching wallet balance' });
        }
    },

    // Get wallet transaction history (bookings that earned money)
    getWalletTransactions: async (req, res) => {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Find clubs owned by this user
            const clubs = await BilliardsClub.find({ Owner: userId });
            const clubIds = clubs.map(c => c._id);

            if (clubIds.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0
                    }
                });
            }

            // Get bookings from clubs owned by this user, then find their payments
            const BilliardsBooking = require('../models/BilliardsBooking');
            const bookings = await BilliardsBooking.find({
                Club: { $in: clubIds },
                Status: 'confirmed'
            })
                .populate('Club', 'Name')
                .populate('User', 'Name Email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Get payments for these bookings
            const bookingIds = bookings.map(b => b._id);
            const payments = await Payment.find({
                Type: 'booking',
                Status: 'PAID',
                Booking: { $in: bookingIds }
            }).sort({ updatedAt: -1 });

            // Create a map of bookingId -> payment
            const paymentMap = new Map();
            payments.forEach(p => {
                if (p.Booking) {
                    paymentMap.set(p.Booking.toString(), p);
                }
            });

            // Format transactions
            const transactions = bookings
                .filter(booking => paymentMap.has(booking._id.toString()))
                .map(booking => {
                    const payment = paymentMap.get(booking._id.toString());
                    return {
                        id: payment._id,
                        orderCode: payment.OrderCode,
                        amount: payment.Amount,
                        date: payment.updatedAt,
                        booking: {
                            clubName: booking.Club?.Name || 'Unknown Club',
                            bookingDate: booking.BookingDate,
                            startHour: booking.StartHour,
                            endHour: booking.EndHour,
                            status: booking.Status,
                            customerName: booking.User?.Name || 'Unknown'
                        }
                    };
                });

            const total = await BilliardsBooking.countDocuments({
                Club: { $in: clubIds },
                Status: 'confirmed'
            });

            return res.json({
                success: true,
                data: transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get wallet transactions error:', error);
            return res.status(500).json({ message: 'Error fetching wallet transactions' });
        }
    }
};

module.exports = UserController;