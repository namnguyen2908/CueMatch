const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    Email: { type: String, required: true, unique: true },
    Name: { type: String, required: true },
    Avatar: { type: String },
    DateOfBirth: {type: Date},
    Provider: { type: String, enum: ['local', 'google'], default: 'local' },
    ProviderID: { type: String, unique: true, sparse: true },
    Password: { type: String },
    IsOnline: { type: Boolean, default: false },
    Role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true }
);

userSchema.pre('save', function(next) {
    const vnOffset = 7 * 60 * 60 * 1000; // 7 giờ = 25200000 ms
    if (this.createdAt) this.createdAt = new Date(this.createdAt.getTime() + vnOffset);
    if (this.updatedAt) this.updatedAt = new Date(this.updatedAt.getTime() + vnOffset);
    next(); 
});

module.exports = mongoose.model('User', userSchema);