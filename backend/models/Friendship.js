const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
    User1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    User2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

friendshipSchema.index({ User1: 1, User2: 1 }, { unique: true });

module.exports = mongoose.model('Friendship', friendshipSchema);