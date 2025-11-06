const TableRate = require('../models/TableRate');
const BilliardsClub = require('../models/BilliardsClub');

const TableRateController = {

    createTableRate: async (req, res) => {
        try {
            const { clubId } = req.params;
            const { Type, PricePerHour } = req.body;

            const club = await BilliardsClub.findById(clubId);
            if (!club) {
                return res.status(404).json({ message: 'Billiards club not found.' });
            }

            const existingRate = await TableRate.findOne({ Club: clubId, Type });
            if (existingRate) {
                return res.status(400).json({ message: 'Rate for this table type already exists.' });
            }

            const newRate = await TableRate.create({
                Club: clubId,
                Type,
                PricePerHour
            });

            res.status(201).json({ message: 'Table rate created successfully.', data: newRate });
        } catch (err) {
            res.status(500).json({ message: 'Server error.', error: err.message });
        }
    },

    updateTableRate: async (req, res) => {
        try {
            const { clubId, type } = req.params;
            const { PricePerHour } = req.body;

            const rate = await TableRate.findOne({ Club: clubId, Type: type });
            if (!rate) {
                return res.status(404).json({ message: 'Table rate not found.' });
            }

            rate.PricePerHour = PricePerHour;
            await rate.save();

            res.status(200).json({ message: 'Table rate updated successfully.', data: rate });
        } catch (err) {
            res.status(500).json({ message: 'Server error.', error: err.message });
        }
    },

    getTableRates: async (req, res) => {
        try {
            const { clubId, type } = req.params;
            const rate = await TableRate.findOne({ Club: clubId, Type: type });
            if (!rate) {
                return res.status(404).json({ message: 'Table rate not found.' });
            }

            res.status(200).json({ data: rate });
        } catch (err) {
            res.status(500).json({ message: 'Server error.', error: err.message });
        }
    },
};

module.exports = TableRateController;