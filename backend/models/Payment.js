const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  User: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' }, // Optional for booking payments
  Booking: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsBooking' }, // For booking payments
  Type: { 
    type: String, 
    enum: ['subscription', 'booking'], 
    default: 'subscription' 
  },
  OrderCode: { type: String, required: true, unique: true },
  Amount: { type: Number, required: true },
  Status: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'FAILED'], 
    default: 'PENDING' 
  },
  Description: { type: String },
  BookingData: { 
    clubId: { type: mongoose.Schema.Types.ObjectId },
    tableType: { type: String },
    bookingDate: { type: String },
    startHour: { type: Number },
    endHour: { type: Number },
    note: { type: String }
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);