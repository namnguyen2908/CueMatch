const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người nhận thông báo
    FromUserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người gây ra hành động
    Type: {
        type: String,
        enum: ['like', 'comment', 'friend_request', 'friend_accepted', 'matching_request', 'matching_accepted', 'new_booking'],
        required: true
    },
    PostID: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null }, // Cho like và comment
    CommentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // Cho comment
    FriendRequestID: { type: mongoose.Schema.Types.ObjectId, ref: 'FriendRequest', default: null }, // Cho friend request
    MatchInvitationID: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchInvitation', default: null }, // Cho matching request
    BookingID: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsBooking', default: null }, // Cho booking
    IsRead: { type: Boolean, default: false },
    Message: { type: String }, // Nội dung thông báo
}, { timestamps: true });

// Index để query nhanh hơn
notificationSchema.index({ UserID: 1, IsRead: 1, createdAt: -1 });
notificationSchema.index({ UserID: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

