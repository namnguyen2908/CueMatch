const mongoose = require("mongoose");

const playerBioSchema = new mongoose.Schema({
    User: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    PlayStyles: [{
        PlayType: { type: String, enum: ['Pool', 'Carom', 'Snooker'], required: true },
        Rank: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'G', 'H'], required: true }
    }],
    Address: {
        Ward: { type: String },
        District: { type: String },
        City: { type: String }
    },
    AvailableTimes: [{ type: String, enum: ['Morning', 'Noon', 'Afternoon', 'Evening'] }],
    PlayGoals: [{ type: String, enum: ['Have fun!', 'Find a bet', 'Practice', 'Find friends'] }],
}, { timestamps: true });

module.exports = mongoose.model('PlayerBio', playerBioSchema);