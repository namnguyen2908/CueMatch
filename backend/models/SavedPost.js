const mongoose = require("mongoose");

const savedPostSchema = new mongoose.Schema({
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    PostID: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    SavedAt: { type: Date, default: Date.now },
}, {
    timestamps: true
});

savedPostSchema.index({ UserID: 1, PostID: 1 }, { unique: true });

module.exports = mongoose.model('SavedPost', savedPostSchema);