const mongoose = require('mongoose');

const billiardsClubSchema = new mongoose.Schema({
  Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Name: { type: String, required: true },
  Address: { type: String, required: true },
  Phone: String,
  Description: String,
  CoverImage: String,
  OpenTime: String,  // VD: '09:00'
  CloseTime: String, // VD: '23:00'
  IsActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BilliardsClub', billiardsClubSchema);