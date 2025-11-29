const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  User: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  Club: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsClub' },
  Table: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsTable' },
  BookingDate: { type: String, required: true }, // YYYY-MM-DD
  StartHour: { type: Number, required: true }, // 0–24 (theo giờ)
  EndHour: { type: Number, required: true },
  CheckInTime: { type: Date },
  CheckOutTime: { type: Date },
  Status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'checked-in', 'completed'],
    default: 'pending'
  },
  TotalAmount: { type: Number },
  Note: { type: String },
  IsWalkIn: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('BilliardsBooking', bookingSchema);