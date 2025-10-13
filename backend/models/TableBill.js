const mongoose = require("mongoose");

const tableBillSchema = new mongoose.Schema({
  Booking: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsBooking', required: true },
  IssuedAt: { type: Date, default: Date.now },
  TotalAmount: Number,
  PaymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
  Paid: { type: Boolean, default: false }
});

module.exports = mongoose.model('TableBill', tableBillSchema);