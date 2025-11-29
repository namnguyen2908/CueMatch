const BilliardsTable = require('../models/BilliardsTable');
const BilliardsClub = require('../models/BilliardsClub');
const BilliardsBooking = require('../models/BilliardsBooking');
const mongoose = require('mongoose');

const BilliardsTableController = {
    createTable: async (req, res) => {
        try {
            const { Club, TableNumber, Type } = req.body;
            const userId = req.user.id;

            // Validate required fields
            if (!Club || !TableNumber) {
                return res.status(400).json({ message: 'Missing required fields: Club, TableNumber' });
            }

            // Validate Club ID format
            if (!mongoose.Types.ObjectId.isValid(Club)) {
                return res.status(400).json({ message: 'Invalid club ID format' });
            }

            // Validate TableNumber
            if (!TableNumber || TableNumber.trim().length === 0) {
                return res.status(400).json({ message: 'TableNumber cannot be empty' });
            }

            if (TableNumber.length > 50) {
                return res.status(400).json({ message: 'TableNumber must not exceed 50 characters' });
            }

            // Validate Type if provided
            const validTypes = ['Pool', 'Carom', 'Snooker'];
            if (Type && !validTypes.includes(Type)) {
                return res.status(400).json({ message: `Invalid table type. Must be one of: ${validTypes.join(', ')}` });
            }

            // Kiểm tra quán có thuộc về user không
            const club = await BilliardsClub.findOne({ _id: Club, Owner: userId });
            if (!club) {
                return res.status(403).json({ message: 'You do not have permission to add tables to this club' });
            }

            // Check if table number already exists in this club
            const existingTable = await BilliardsTable.findOne({ Club, TableNumber: TableNumber.trim() });
            if (existingTable) {
                return res.status(409).json({ message: 'Table number already exists in this club' });
            }

            const newTable = new BilliardsTable({ 
                Club, 
                TableNumber: TableNumber.trim(), 
                Type: Type || 'Pool' 
            });
            await newTable.save();
            return res.status(201).json({ message: 'Table created successfully', table: newTable });
        } catch (error) {
            console.error('createTable error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getTableByClub: async (req, res) => {
        try {
            const { clubId } = req.params;

            // Validate clubId format
            if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
                return res.status(400).json({ message: 'Invalid club ID format' });
            }

            const tables = await BilliardsTable.find({ Club: clubId }).lean();
            // Với mỗi bàn, tìm booking đang hoạt động nếu có
            for (let table of tables) {
                const activeBooking = await BilliardsBooking.findOne({
                    Table: table._id,
                    Status: 'checked-in'
                }).select('_id CheckInTime User TotalAmount');

                if (activeBooking) {
                    table.activeBooking = {
                        _id: activeBooking._id,
                        CheckInTime: activeBooking.CheckInTime,
                        User: activeBooking.User,
                        TotalAmount: activeBooking.TotalAmount
                    };
                }
            }

            return res.json(tables);
        } catch (error) {
            console.error('getTableByClub error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    updateTable: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            // Validate ID format
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid table ID format' });
            }

            const table = await BilliardsTable.findById(id);
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }

            const club = await BilliardsClub.findOne({ _id: table.Club, Owner: userId });
            if (!club) {
                return res.status(403).json({ message: 'You do not have permission to update this table' });
            }

            // Validate allowed fields
            const allowedFields = ['TableNumber', 'Type', 'Status'];
            const updates = {};

            // Validate TableNumber if provided
            if (updateData.TableNumber !== undefined) {
                if (!updateData.TableNumber || updateData.TableNumber.trim().length === 0) {
                    return res.status(400).json({ message: 'TableNumber cannot be empty' });
                }
                if (updateData.TableNumber.length > 50) {
                    return res.status(400).json({ message: 'TableNumber must not exceed 50 characters' });
                }
                
                // Check if table number already exists in this club (excluding current table)
                const existingTable = await BilliardsTable.findOne({ 
                    Club: table.Club, 
                    TableNumber: updateData.TableNumber.trim(),
                    _id: { $ne: id }
                });
                if (existingTable) {
                    return res.status(409).json({ message: 'Table number already exists in this club' });
                }
                
                updates.TableNumber = updateData.TableNumber.trim();
            }

            // Validate Type if provided
            if (updateData.Type !== undefined) {
                const validTypes = ['Pool', 'Carom', 'Snooker'];
                if (!validTypes.includes(updateData.Type)) {
                    return res.status(400).json({ message: `Invalid table type. Must be one of: ${validTypes.join(', ')}` });
                }
                updates.Type = updateData.Type;
            }

            // Validate Status if provided
            if (updateData.Status !== undefined) {
                const validStatuses = ['available', 'reserved', 'occupied'];
                if (!validStatuses.includes(updateData.Status)) {
                    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
                }
                updates.Status = updateData.Status;
            }

            // Apply updates
            Object.assign(table, updates);
            await table.save();

            return res.json({ message: 'Table updated successfully', table });
        } catch (error) {
            console.error('updateTable error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    deleteTable: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Validate ID format
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid table ID format' });
            }

            const table = await BilliardsTable.findById(id);
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }

            const club = await BilliardsClub.findOne({ _id: table.Club, Owner: userId });
            if (!club) {
                return res.status(403).json({ message: 'You do not have permission to delete this table' });
            }

            // Check if table has active bookings
            const activeBooking = await BilliardsBooking.findOne({
                Table: id,
                Status: { $in: ['confirmed', 'checked-in'] }
            });

            if (activeBooking) {
                return res.status(400).json({ message: 'Cannot delete table with active bookings' });
            }

            await BilliardsTable.findByIdAndDelete(id);
            return res.json({ message: 'Table deleted successfully' });
        } catch (error) {
            console.error('deleteTable error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getDetailTable: async (req, res) => {
        try {
            const { id } = req.params;

            // Validate ID format
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid table ID format' });
            }

            const table = await BilliardsTable.findById(id).populate('Club');
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }
            return res.json(table);
        } catch (error) {
            console.error('getDetailTable error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

module.exports = BilliardsTableController;