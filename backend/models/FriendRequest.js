const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
    From: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    To: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

friendRequestSchema.index({ From: 1, To: 1 }, { unique: true }); // Không cho gửi trùng lời mời

module.exports = mongoose.model('FriendRequest', friendRequestSchema);