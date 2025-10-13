const mongoose = require('mongoose');

const billiardsTableSchema = new mongoose.Schema({
  Club: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsClub', required: true },
  TableNumber: { type: String, required: true },
  Type: { type: String, enum: ['Pool', 'Carom', 'Snooker'], default: 'Pool' },
  Status: { type: String, enum: ['available', 'reserved', 'occupied'], default: 'available' },
}, { timestamps: true });

module.exports = mongoose.model('BilliardsTable', billiardsTableSchema);