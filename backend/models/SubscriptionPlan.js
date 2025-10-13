const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Type: { type: String, enum: ['user', 'partner'], required: true },
  Price: { type: Number, required: true },
  Duration: { type: Number, default: 30 },
  Features: [{
    Key: { type: String, required: true },
    Description: { type: String }, // ✅ Thêm mô tả cho từng tính năng
    MonthlyLimit: {
      type: Number,
      default: null,
      // Bạn không thể set default dựa vào "Type" ở đây, nên xử lý ở controller/middleware
    }
  }],
  IsActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);