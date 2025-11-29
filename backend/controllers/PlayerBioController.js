const PlayerBio = require('../models/PlayerBio');
const User = require('../models/User');
const mongoose = require('mongoose');

const PlayerBioController = {
    createPlayerBio: async (req, res) => {
        try {
            const { PlayStyles, Address, AvailableTimes, PlayGoals } = req.body;
            const userId = req.user.id;

            // Check if bio already exists for this user
            const existing = await PlayerBio.findOne({ User: userId });
            if (existing) {
                return res.status(400).json({ message: 'PlayerBio already exists for this user' });
            }

            // Validate PlayStyles
            if (!PlayStyles || !Array.isArray(PlayStyles) || PlayStyles.length === 0) {
                return res.status(400).json({ message: 'PlayStyles is required and must be a non-empty array' });
            }

            const validPlayTypes = ['Pool', 'Carom', 'Snooker'];
            const validRanks = ['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'G', 'H'];

            for (let i = 0; i < PlayStyles.length; i++) {
                const style = PlayStyles[i];
                if (!style.PlayType || !validPlayTypes.includes(style.PlayType)) {
                    return res.status(400).json({ 
                        message: `Invalid PlayType at index ${i}. Must be one of: ${validPlayTypes.join(', ')}` 
                    });
                }
                if (!style.Rank || !validRanks.includes(style.Rank)) {
                    return res.status(400).json({ 
                        message: `Invalid Rank at index ${i}. Must be one of: ${validRanks.join(', ')}` 
                    });
                }
            }

            // Check for duplicate PlayTypes
            const playTypes = PlayStyles.map(s => s.PlayType);
            const uniquePlayTypes = new Set(playTypes);
            if (playTypes.length !== uniquePlayTypes.size) {
                return res.status(400).json({ message: 'Duplicate PlayType found. Each PlayType can only appear once' });
            }

            // Validate Address if provided
            if (Address) {
                if (typeof Address !== 'object' || Array.isArray(Address)) {
                    return res.status(400).json({ message: 'Address must be an object' });
                }
                if (Address.Ward && (typeof Address.Ward !== 'string' || Address.Ward.length > 100)) {
                    return res.status(400).json({ message: 'Address.Ward must be a string not exceeding 100 characters' });
                }
                if (Address.District && (typeof Address.District !== 'string' || Address.District.length > 100)) {
                    return res.status(400).json({ message: 'Address.District must be a string not exceeding 100 characters' });
                }
                if (Address.City && (typeof Address.City !== 'string' || Address.City.length > 100)) {
                    return res.status(400).json({ message: 'Address.City must be a string not exceeding 100 characters' });
                }
            }

            // Validate AvailableTimes if provided
            if (AvailableTimes !== undefined) {
                if (!Array.isArray(AvailableTimes)) {
                    return res.status(400).json({ message: 'AvailableTimes must be an array' });
                }
                const validTimes = ['Morning', 'Noon', 'Afternoon', 'Evening'];
                for (let i = 0; i < AvailableTimes.length; i++) {
                    if (!validTimes.includes(AvailableTimes[i])) {
                        return res.status(400).json({ 
                            message: `Invalid AvailableTime at index ${i}. Must be one of: ${validTimes.join(', ')}` 
                        });
                    }
                }
                // Check for duplicates
                const uniqueTimes = new Set(AvailableTimes);
                if (AvailableTimes.length !== uniqueTimes.size) {
                    return res.status(400).json({ message: 'Duplicate AvailableTime found' });
                }
            }

            // Validate PlayGoals if provided
            if (PlayGoals !== undefined) {
                if (!Array.isArray(PlayGoals)) {
                    return res.status(400).json({ message: 'PlayGoals must be an array' });
                }
                const validGoals = ['Have fun!', 'Find a bet', 'Practice', 'Find friends'];
                for (let i = 0; i < PlayGoals.length; i++) {
                    if (!validGoals.includes(PlayGoals[i])) {
                        return res.status(400).json({ 
                            message: `Invalid PlayGoal at index ${i}. Must be one of: ${validGoals.join(', ')}` 
                        });
                    }
                }
                // Check for duplicates
                const uniqueGoals = new Set(PlayGoals);
                if (PlayGoals.length !== uniqueGoals.size) {
                    return res.status(400).json({ message: 'Duplicate PlayGoal found' });
                }
            }

            const newBio = new PlayerBio({
                User: userId,
                PlayStyles,
                Address: Address || {},
                AvailableTimes: AvailableTimes || [],
                PlayGoals: PlayGoals || []
            });

            const savedBio = await newBio.save();
            res.status(201).json({ message: 'PlayerBio created successfully', bio: savedBio });
        } catch (error) {
            console.error('Error creating PlayerBio:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getPlayerBioByUserId: async (req, res) => {
        try {
            const { userId } = req.params;

            // Validate userId format
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            const bio = await PlayerBio.findOne({ User: userId }).populate('User', 'Name Avatar Email');
            if (!bio) {
                return res.status(404).json({ message: 'PlayerBio not found' });
            }
            res.status(200).json(bio);
        } catch (error) {
            console.error('Error fetching PlayerBio:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    updatePlayerBio: async (req, res) => {
        try {
            const userId = req.user.id;
            const updates = req.body;

            // Check if bio exists
            const existingBio = await PlayerBio.findOne({ User: userId });
            if (!existingBio) {
                return res.status(404).json({ message: 'PlayerBio not found' });
            }

            // Validate PlayStyles if provided
            if (updates.PlayStyles !== undefined) {
                if (!Array.isArray(updates.PlayStyles) || updates.PlayStyles.length === 0) {
                    return res.status(400).json({ message: 'PlayStyles must be a non-empty array' });
                }

                const validPlayTypes = ['Pool', 'Carom', 'Snooker'];
                const validRanks = ['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'G', 'H'];

                for (let i = 0; i < updates.PlayStyles.length; i++) {
                    const style = updates.PlayStyles[i];
                    if (!style.PlayType || !validPlayTypes.includes(style.PlayType)) {
                        return res.status(400).json({ 
                            message: `Invalid PlayType at index ${i}. Must be one of: ${validPlayTypes.join(', ')}` 
                        });
                    }
                    if (!style.Rank || !validRanks.includes(style.Rank)) {
                        return res.status(400).json({ 
                            message: `Invalid Rank at index ${i}. Must be one of: ${validRanks.join(', ')}` 
                        });
                    }
                }

                // Check for duplicate PlayTypes
                const playTypes = updates.PlayStyles.map(s => s.PlayType);
                const uniquePlayTypes = new Set(playTypes);
                if (playTypes.length !== uniquePlayTypes.size) {
                    return res.status(400).json({ message: 'Duplicate PlayType found. Each PlayType can only appear once' });
                }
            }

            // Validate Address if provided
            if (updates.Address !== undefined) {
                if (typeof updates.Address !== 'object' || Array.isArray(updates.Address)) {
                    return res.status(400).json({ message: 'Address must be an object' });
                }
                if (updates.Address.Ward !== undefined) {
                    if (typeof updates.Address.Ward !== 'string' || updates.Address.Ward.length > 100) {
                        return res.status(400).json({ message: 'Address.Ward must be a string not exceeding 100 characters' });
                    }
                }
                if (updates.Address.District !== undefined) {
                    if (typeof updates.Address.District !== 'string' || updates.Address.District.length > 100) {
                        return res.status(400).json({ message: 'Address.District must be a string not exceeding 100 characters' });
                    }
                }
                if (updates.Address.City !== undefined) {
                    if (typeof updates.Address.City !== 'string' || updates.Address.City.length > 100) {
                        return res.status(400).json({ message: 'Address.City must be a string not exceeding 100 characters' });
                    }
                }
            }

            // Validate AvailableTimes if provided
            if (updates.AvailableTimes !== undefined) {
                if (!Array.isArray(updates.AvailableTimes)) {
                    return res.status(400).json({ message: 'AvailableTimes must be an array' });
                }
                const validTimes = ['Morning', 'Noon', 'Afternoon', 'Evening'];
                for (let i = 0; i < updates.AvailableTimes.length; i++) {
                    if (!validTimes.includes(updates.AvailableTimes[i])) {
                        return res.status(400).json({ 
                            message: `Invalid AvailableTime at index ${i}. Must be one of: ${validTimes.join(', ')}` 
                        });
                    }
                }
                // Check for duplicates
                const uniqueTimes = new Set(updates.AvailableTimes);
                if (updates.AvailableTimes.length !== uniqueTimes.size) {
                    return res.status(400).json({ message: 'Duplicate AvailableTime found' });
                }
            }

            // Validate PlayGoals if provided
            if (updates.PlayGoals !== undefined) {
                if (!Array.isArray(updates.PlayGoals)) {
                    return res.status(400).json({ message: 'PlayGoals must be an array' });
                }
                const validGoals = ['Have fun!', 'Find a bet', 'Practice', 'Find friends'];
                for (let i = 0; i < updates.PlayGoals.length; i++) {
                    if (!validGoals.includes(updates.PlayGoals[i])) {
                        return res.status(400).json({ 
                            message: `Invalid PlayGoal at index ${i}. Must be one of: ${validGoals.join(', ')}` 
                        });
                    }
                }
                // Check for duplicates
                const uniqueGoals = new Set(updates.PlayGoals);
                if (updates.PlayGoals.length !== uniqueGoals.size) {
                    return res.status(400).json({ message: 'Duplicate PlayGoal found' });
                }
            }

            const updatedBio = await PlayerBio.findOneAndUpdate(
                { User: userId },
                updates,
                { new: true, runValidators: true }
            );

            res.status(200).json({ message: 'PlayerBio updated successfully', bio: updatedBio });
        } catch (error) {
            console.error('Error updating PlayerBio:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    deletePlayerBio: async (req, res) => {
        try {
            const userId = req.user.id;

            const deleted = await PlayerBio.findOneAndDelete({ User: userId });
            if (!deleted) {
                return res.status(404).json({ message: 'PlayerBio not found' });
            }

            res.status(200).json({ message: 'PlayerBio deleted successfully' });
        } catch (error) {
            console.error('Error deleting PlayerBio:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
}

module.exports = PlayerBioController;