const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Content: { type: String, required: true },
    Image: [{ type: String }],
    Video: [{ type: String }],
    Status: { type: String, enum: ['public', 'friends', 'group'], default: 'public' },
    GroupID: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    CommentCount: { type: Number, default: 0 },
    ReactionCounts: {
        like: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        haha: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 },
    }
}, { timestamps: true }
);

postSchema.pre('validate', function (next) {
    if (this.Status === 'group' && !this.GroupID) {
        this.invalidate('GroupID', 'GroupID is required when status is "group"');
    }
    next();
});

module.exports = mongoose.model('Post', postSchema);