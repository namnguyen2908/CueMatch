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
    }
};

module.exports = UserController;