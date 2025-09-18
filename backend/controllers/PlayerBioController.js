const PlayerBio = require('../models/PlayerBio');
const User = require('../models/User');

const PlayerBioController = {
    createPlayerBio: async (req, res) => {
        try {
            const { PlayStyles, Address, AvailableTimes, PlayGoals } = req.body;
            const userId = req.user.id; // from auth middleware

            // Check if bio already exists for this user
            const existing = await PlayerBio.findOne({ User: userId });
            if (existing) {
                return res.status(400).json({ message: 'PlayerBio already exists for this user.' });
            }

            const newBio = new PlayerBio({
                User: userId,
                PlayStyles,
                Address,
                AvailableTimes,
                PlayGoals
            });

            const savedBio = await newBio.save();
            res.status(201).json(savedBio);
        } catch (error) {
            console.error('Error creating PlayerBio:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getPlayerBioByUserId: async (req, res) => {
        try {
            const { userId } = req.params;
            const bio = await PlayerBio.findOne({ User: userId }).populate('User', 'Name Avatar Email');
            if (!bio) {
                return res.status(404).json({ message: 'PlayerBio not found' });
            }
            res.status(200).json(bio);
        } catch (error) {
            console.error('Error fetching PlayerBio:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updatePlayerBio: async (req, res) => {
        try {
            const userId = req.user.id;
            const updates = req.body;

            const updatedBio = await PlayerBio.findOneAndUpdate(
                { User: userId },
                updates,
                { new: true, runValidators: true }
            );

            if (!updatedBio) {
                return res.status(404).json({ message: 'PlayerBio not found' });
            }

            res.status(200).json(updatedBio);
        } catch (error) {
            console.error('Error updating PlayerBio:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    deletePlayerBio: async (req, res) => {
        try {
            const userId = req.user.id;

            const deleted = await PlayerBio.findOneAndDelete({ User: userId });
            if (!deleted) {
                return res.status(404).json({ message: 'PlayerBio not found' });
            }

            res.status(200).json({ message: 'PlayerBio deleted' });
        } catch (error) {
            console.error('Error deleting PlayerBio:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
}

module.exports = PlayerBioController;