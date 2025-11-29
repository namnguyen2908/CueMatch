const TableRate = require('../models/TableRate');
const BilliardsClub = require('../models/BilliardsClub');
const mongoose = require('mongoose');

const TableRateController = {

    createTableRate: async (req, res) => {
        try {
            const { clubId } = req.params;
            const { Type, PricePerHour } = req.body;
            const userId = req.user.id;

            // Validate clubId format
            if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
                return res.status(400).json({ message: 'Invalid club ID format' });
            }

            // Validate required fields
            if (!Type || !PricePerHour) {
                return res.status(400).json({ message: 'Missing required fields: Type, PricePerHour' });
            }

            // Validate Type enum
            const validTypes = ['Pool', 'Carom', 'Snooker'];
            if (!validTypes.includes(Type)) {
                return res.status(400).json({ message: `Invalid Type. Must be one of: ${validTypes.join(', ')}` });
            }

            // Validate PricePerHour must be a number (not text)
            if (typeof PricePerHour !== 'number' && isNaN(Number(PricePerHour))) {
                return res.status(400).json({ message: 'PricePerHour must be a number, text is not allowed' });
            }

            const priceNum = Number(PricePerHour);
            if (isNaN(priceNum) || !isFinite(priceNum)) {
                return res.status(400).json({ message: 'PricePerHour must be a valid number' });
            }

            if (priceNum <= 0) {
                return res.status(400).json({ message: 'PricePerHour must be greater than 0' });
            }

            if (priceNum > 10000000) {
                return res.status(400).json({ message: 'PricePerHour must not exceed 10,000,000' });
            }

            // Check if club exists and user owns it
            const club = await BilliardsClub.findById(clubId);
            if (!club) {
                return res.status(404).json({ message: 'Billiards club not found' });
            }

            if (club.Owner.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'You do not have permission to create rates for this club' });
            }

            // Check if rate already exists
            const existingRate = await TableRate.findOne({ Club: clubId, Type });
            if (existingRate) {
                return res.status(400).json({ message: 'Rate for this table type already exists' });
            }

            const newRate = await TableRate.create({
                Club: clubId,
                Type,
                PricePerHour: priceNum
            });

            res.status(201).json({ message: 'Table rate created successfully', data: newRate });
        } catch (err) {
            console.error('createTableRate error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    updateTableRate: async (req, res) => {
        try {
            const { clubId, type } = req.params;
            const { PricePerHour } = req.body;
            const userId = req.user.id;

            // Validate clubId format
            if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
                return res.status(400).json({ message: 'Invalid club ID format' });
            }

            // Validate type
            const validTypes = ['Pool', 'Carom', 'Snooker'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ message: `Invalid Type. Must be one of: ${validTypes.join(', ')}` });
            }

            // Validate required field
            if (PricePerHour === undefined || PricePerHour === null) {
                return res.status(400).json({ message: 'PricePerHour is required' });
            }

            // Validate PricePerHour must be a number (not text)
            if (typeof PricePerHour !== 'number' && isNaN(Number(PricePerHour))) {
                return res.status(400).json({ message: 'PricePerHour must be a number, text is not allowed' });
            }

            const priceNum = Number(PricePerHour);
            if (isNaN(priceNum) || !isFinite(priceNum)) {
                return res.status(400).json({ message: 'PricePerHour must be a valid number' });
            }

            if (priceNum <= 0) {
                return res.status(400).json({ message: 'PricePerHour must be greater than 0' });
            }

            if (priceNum > 10000000) {
                return res.status(400).json({ message: 'PricePerHour must not exceed 10,000,000' });
            }

            // Check if rate exists
            const rate = await TableRate.findOne({ Club: clubId, Type: type });
            if (!rate) {
                return res.status(404).json({ message: 'Table rate not found' });
            }

            // Check if user owns the club
            const club = await BilliardsClub.findById(clubId);
            if (!club) {
                return res.status(404).json({ message: 'Billiards club not found' });
            }

            if (club.Owner.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'You do not have permission to update rates for this club' });
            }

            rate.PricePerHour = priceNum;
            await rate.save();

            res.status(200).json({ message: 'Table rate updated successfully', data: rate });
        } catch (err) {
            console.error('updateTableRate error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    getTableRates: async (req, res) => {
        try {
            const { clubId, type } = req.params;

            // Validate clubId format
            if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
                return res.status(400).json({ message: 'Invalid club ID format' });
            }

            // Validate type
            const validTypes = ['Pool', 'Carom', 'Snooker'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ message: `Invalid Type. Must be one of: ${validTypes.join(', ')}` });
            }

            const rate = await TableRate.findOne({ Club: clubId, Type: type });
            if (!rate) {
                return res.status(404).json({ message: 'Table rate not found' });
            }

            res.status(200).json({ data: rate });
        } catch (err) {
            console.error('getTableRates error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },
};

module.exports = TableRateController;