const mongoose = require("mongoose");

const tableRateSchema = new mongoose.Schema({
  Club: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsClub', required: true },
  Type: { type: String, enum: ['Pool', 'Carom', 'Snooker'], required: true, unique: true },
  PricePerHour: { type: Number, required: true } // đơn vị: đồng/giờ
}, { timestamps: true });

module.exports = mongoose.model('TableRate', tableRateSchema);