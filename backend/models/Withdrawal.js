const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  User: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Amount: { type: Number, required: true },
  AccountNumber: { type: String, required: true },
  BankName: { type: String, required: true },
  RecipientName: { type: String, required: true },
  Status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  RejectionReason: { type: String },
  ProcessedAt: { type: Date },
  ProcessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);

