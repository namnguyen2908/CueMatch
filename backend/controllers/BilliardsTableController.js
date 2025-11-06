const BilliardsTable = require('../models/BilliardsTable');
const BilliardsClub = require('../models/BilliardsClub');
const BilliardsBooking = require('../models/BilliardsBooking');

const BilliardsTableController = {
    createTable: async (req, res) => {
        try {
            const { Club, TableNumber, Type } = req.body;
            const userId = req.user.id;

            // Kiểm tra quán có thuộc về user không
            const club = await BilliardsClub.findOne({ _id: Club, Owner: userId });
            if (!club) {
                return res.status(403).json({ message: 'You do not have permission to add tables to this club' });
            }

            const newTable = new BilliardsTable({ Club, TableNumber, Type });
            await newTable.save();
            return res.status(201).json(newTable);
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi tạo bàn.', error });
        }
    },

    getTableByClub: async (req, res) => {
        try {
            const { clubId } = req.params;
            const tables = await BilliardsTable.find({ Club: clubId }).lean();
            // Với mỗi bàn, tìm booking đang hoạt động nếu có
            for (let table of tables) {
                const activeBooking = await BilliardsBooking.findOne({
                    Table: table._id,
                    Status: 'checked-in' // hoặc status bạn đang dùng khi bàn đang được sử dụng
                }).select('_id StartTime User TotalAmount');

                if (activeBooking) {
                    table.activeBooking = {
                        _id: activeBooking._id,
                        StartTime: activeBooking.StartTime,
                        User: activeBooking.User,
                        TotalAmount: activeBooking.TotalAmount
                    };
                }
            }

            return res.json(tables);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi lấy danh sách bàn.', error });
        }
    },

    updateTable: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            const table = await BilliardsTable.findById(id);
            if (!table) {
                return res.status(404).json({ message: 'Không tìm thấy bàn.' });
            }

            const club = await BilliardsClub.findOne({ _id: table.Club, Owner: userId });
            if (!club) {
                return res.status(403).json({ message: 'Bạn không có quyền cập nhật bàn này.' });
            }

            Object.assign(table, updateData);
            await table.save();

            return res.json(table);
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi cập nhật bàn.', error });
        }
    },

    deleteTable: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const table = await BilliardsTable.findById(id);
            if (!table) {
                return res.status(404).json({ message: 'Không tìm thấy bàn.' });
            }

            const club = await BilliardsClub.findOne({ _id: table.Club, Owner: userId });
            if (!club) {
                return res.status(403).json({ message: 'Bạn không có quyền xóa bàn này.' });
            }

            await BilliardsTable.findByIdAndDelete(id);
            return res.json({ message: 'Đã xóa bàn thành công.' });
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi xóa bàn.', error });
        }
    },

    getDetailTable: async (req, res) => {
        try {
            const { id } = req.params;
            const table = await BilliardsTable.findById(id).populate('Club');
            if (!table) {
                return res.status(404).json({ message: 'Không tìm thấy bàn.' });
            }
            return res.json(table);
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi lấy thông tin bàn.', error });
        }
    }
}

module.exports = BilliardsTableController;