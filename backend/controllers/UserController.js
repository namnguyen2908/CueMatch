const User = require("../models/User");

const UserController = {
    // Lấy thông tin user hiện tại (theo token)
    getUserDetail: async (req, res) => {
        try {
            const userId = req.params.userId || req.user.id; // Ưu tiên params, fallback token

            const user = await User.findById(userId).select("-Password -Provider -ProviderID -Role");
            if (!user) return res.status(404).json({ message: "User not found" });

            res.status(200).json(user);
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
    }
};

module.exports = UserController;