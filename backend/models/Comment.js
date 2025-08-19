const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    PostID: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ParentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // bình luận cha, nếu có
    Content: { type: String, required: true },
    Likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // người đã like comment
}, { timestamps: true });

commentSchema.pre('save', function(next) {
    const vnOffset = 7 * 60 * 60 * 1000; // GMT+7
    if (this.createdAt) this.createdAt = new Date(this.createdAt.getTime() + vnOffset);
    if (this.updatedAt) this.updatedAt = new Date(this.updatedAt.getTime() + vnOffset);
    next();
});

module.exports = mongoose.model('Comment', commentSchema);
