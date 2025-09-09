const mongoose = require("mongoose");

const playerBioSchema = new mongoose.Schema({
    User: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    Rank: { type: String, enum: ['A', 'B+', 'B', 'C'], required: true },
    PlayTypes: [{ type: String, enum: ['Pool', 'Carom', 'Snooker'] }],
    Address: [{ type: String }],
    AvailableTimes: [{ type: String, enum: ['Chiều', 'Tối', 'Cuối tuần'] }],
    PlayGoals: [{ type: String, enum: ['Have fun!', 'Find a bet', 'Practice', 'Find friends'] }],
}, { timestamps: true });

module.exports = mongoose.model('PlayerBio', playerBioSchema);