const mongoose = require("mongoose");

const tableRateSchema = new mongoose.Schema({
  Club: { type: mongoose.Schema.Types.ObjectId, ref: 'BilliardsClub', required: true },
  Type: { type: String, enum: ['Pool', 'Carom', 'Snooker']},
  PricePerHour: { type: Number, required: true } // đơn vị: đồng/giờ
}, { timestamps: true });

tableRateSchema.index({ Club: 1, Type: 1 }, { unique: true });

module.exports = mongoose.model('TableRate', tableRateSchema);