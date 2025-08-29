const User = require("../models/User");

const UserController = {
    // Lấy thông tin user hiện tại (theo token)
    getUserDetail: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select("-Password");
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Xoá user
    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.user.id);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Cập nhật thông tin user (name, date of birth, avatar)
    updateUser: async (req, res) => {
        try {
            
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getUser: async (req, res) => {
        try {
            const {UserID} = req.user.id;
            
        } catch (err) {
            console.error("Get user error: ", err);
            return res.status(500).json({message: "Server error"});
        }
    }
};

module.exports = UserController;