mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Content: { type: String, required: true },
    Image: [{ type: String }],
    Video: [{ type: String }],
    Status: { type: String, enum: ['public', 'friends', 'group'], default: 'public' },
    GroupID: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
}, { timestamps: true }
);

postSchema.pre('validate', function (next) {
    if (this.Status === 'group' && !this.GroupID) {
        this.invalidate('GroupID', 'GroupID is required when status is "group"');
    }
    next();
});

postSchema.pre('save', function(next) {
    const vnOffset = 7 * 60 * 60 * 1000; // 7 giờ = 25200000 ms
    if (this.createdAt) this.createdAt = new Date(this.createdAt.getTime() + vnOffset);
    if (this.updatedAt) this.updatedAt = new Date(this.updatedAt.getTime() + vnOffset);
    next();
});

module.exports = mongoose.model('Post', postSchema);