const mongoose = require('mongoose');

const matchInvitationSchema = new mongoose.Schema({
    From: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    To: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Location: { type: String, required: true },
    MatchDate: { type: Date, required: true }, // chỉ ngày (ví dụ: 2025-10-12)
    TimeStart: { type: String, required: true }, // ví dụ: "14:00"
    TimeEnd: { type: String, required: true }, // ví dụ: "16:00"
    Status: { type: String, enum: ['Pending', 'Accepted', 'Declined', 'Cancelled', 'Occurred'], default: 'Pending' },
    PlayType: { type: String, enum: ['Pool', 'Carom', 'Snooker'] },
    Message: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MatchInvitation', matchInvitationSchema);