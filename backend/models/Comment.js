const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    PostID: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ParentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // bình luận cha, nếu có
    Content: { type: String, required: true },
    Likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);