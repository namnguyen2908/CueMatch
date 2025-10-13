const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  User: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  OrderCode: { type: String, required: true, unique: true },
  Amount: { type: Number, required: true },
  Status: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'FAILED'], 
    default: 'PENDING' 
  },
  Description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);