const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    Email: { type: String, required: true, unique: true },
    Name: { type: String, required: true },
    Avatar: { type: String, default: 'https://res.cloudinary.com/dwykod78c/image/upload/v1755433230/user-avatar-icon-social-media-vector-21105671_ghu72m.webp' },
    DateOfBirth: { type: Date },
    Provider: { type: String, enum: ['local', 'google'], default: 'local' },
    ProviderID: { type: String, unique: true, sparse: true },
    Password: { type: String },
    LastSeen: { type: Date, default: null },
    Role: { type: String, enum: ['user', 'admin', 'partner'], default: 'user' },
    Friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    SavedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    CurrentSubscription: {
        Plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
        StartDate: Date,
        EndDate: Date,
        IsActive: { type: Boolean, default: true }
    },
    UsageThisMonth: {
        type: Map,
        of: Number // ví dụ: { 'matching': 3 }
    },
    Wallet: {
        Balance: { type: Number, default: 0 }, // Số dư ví (VND)
        TotalEarned: { type: Number, default: 0 }, // Tổng số tiền đã kiếm được
        TotalWithdrawn: { type: Number, default: 0 } // Tổng số tiền đã rút
    }
}, { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);