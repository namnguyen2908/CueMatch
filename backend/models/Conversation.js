const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    Name: String, // Nếu là nhóm thì có tên nhóm
    Type: { type: String, enum: ['single', 'group'], required: true },
    Members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    Admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Dành cho nhóm
    LastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);