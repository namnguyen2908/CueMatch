const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  ConversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  Sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Text: String,
  Media: [String], // hình ảnh, file,...
  ReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);