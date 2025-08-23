const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    Email: { type: String, required: true, unique: true },
    Name: { type: String, required: true },
    Avatar: { type: String, default: 'https://res.cloudinary.com/dwykod78c/image/upload/v1755433230/user-avatar-icon-social-media-vector-21105671_ghu72m.webp' },
    DateOfBirth: {type: Date},
    Provider: { type: String, enum: ['local', 'google'], default: 'local' },
    ProviderID: { type: String, unique: true, sparse: true },
    Password: { type: String },
    IsOnline: { type: Boolean, default: false },
    Role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);