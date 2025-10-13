const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  User: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  StartDate: { type: Date, default: Date.now },
  EndDate: { type: Date, required: true },
  IsActive: { type: Boolean, default: true },
  ReminderSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);