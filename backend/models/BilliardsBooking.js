const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  User: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  Club: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsClub' },
  Table: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsTable' },
  StartTime: { type: Date, required: true },
  EndTime: { type: Date, required: true },
  CheckInTime: { type: Date }, // Thời gian thực tế bắt đầu
  CheckOutTime: { type: Date },// Thời gian thực tế kết thúc

  Status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'checked-in', 'completed'],
    default: 'pending'
  },
  TotalAmount: { type: Number },
  Note: { type: String}
}, { timestamps: true });

module.exports = mongoose.model('BilliardsBooking', bookingSchema);