const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    PostID: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    Type: {
        type: String,
        enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
        required: true
    },
}, { timestamps: true });

// Một người chỉ được "thả 1 loại reaction" trên một bài viết
reactionSchema.index({ UserID: 1, PostID: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);