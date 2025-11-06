const BilliardsBooking = require('../models/BilliardsBooking');
const BilliardsTable = require('../models/BilliardsTable');
const BilliardsClub = require('../models/BilliardsClub');
const TableRate = require('../models/TableRate');

const BilliardsBookingController = {
    bookTable: async (req, res) => {
        try {
            const { userId, clubId, type, startTime, endTime, note } = req.body;

            // Kiểm tra thời gian
            if (new Date(startTime) >= new Date(endTime)) {
                return res.status(400).json({ message: 'Thời gian không hợp lệ' });
            }

            // Kiểm tra club có hoạt động không
            const club = await BilliardsClub.findById(clubId);
            if (!club || !club.IsActive) {
                return res.status(400).json({ message: 'Câu lạc bộ không hợp lệ hoặc đang tạm nghỉ' });
            }

            // Tìm bàn trống theo loại
            const availableTables = await BilliardsTable.find({
                Club: clubId,
                Type: type,
                Status: 'available'
            });

            if (availableTables.length === 0) {
                return res.status(404).json({ message: 'Không có bàn trống phù hợp' });
            }

            // Kiểm tra bàn có bị đặt trùng giờ không
            let selectedTable = null;

            for (const table of availableTables) {
                const isBooked = await BilliardsBooking.findOne({
                    Table: table._id,
                    $or: [
                        {
                            StartTime: { $lt: new Date(new Date(endTime).getTime() + 15 * 60 * 1000) },
                            EndTime: { $gt: new Date(new Date(startTime).getTime() - 15 * 60 * 1000) }
                        }
                    ],
                    Status: { $in: ['pending', 'confirmed', 'checked-in'] }
                });

                if (!isBooked) {
                    selectedTable = table;
                    break;
                }
            }

            if (!selectedTable) {
                return res.status(409).json({ message: 'Tất cả bàn đều đã được đặt vào thời gian này' });
            }

            // Tính tiền
            const tableRate = await TableRate.findOne({ Club: clubId, Type: type });
            if (!tableRate) {
                return res.status(400).json({ message: 'Không có bảng giá cho loại bàn này' });
            }

            const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
            const totalAmount = Math.ceil(hours * tableRate.PricePerHour);

            // Tạo booking
            const booking = new BilliardsBooking({
                User: userId,
                Club: clubId,
                Table: selectedTable._id,
                StartTime: new Date(startTime),
                EndTime: new Date(endTime),
                TotalAmount: totalAmount,
                Note: note,
                Status: 'confirmed'
            });

            await booking.save();

            // Cập nhật trạng thái bàn (tùy chọn)
            selectedTable.Status = 'reserved';
            await selectedTable.save();

            return res.status(201).json({ message: 'Đặt bàn thành công', booking });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
        }
    },

    cancelBooking: async (req, res) => {
        try {
            const booking = await BilliardsBooking.findById(req.params.id);

            if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking' });

            if (['cancelled', 'completed'].includes(booking.Status)) {
                return res.status(400).json({ message: 'Không thể hủy booking đã hoàn tất hoặc đã bị hủy' });
            }

            booking.Status = 'cancelled';
            await booking.save();

            // Cập nhật trạng thái bàn nếu cần
            const table = await BilliardsTable.findById(booking.Table);
            if (table && table.Status === 'reserved') {
                table.Status = 'available';
                await table.save();
            }

            res.json({ message: 'Hủy booking thành công' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    checkIn: async (req, res) => {
        try {
            const booking = await BilliardsBooking.findById(req.params.id);
            if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking' });

            if (booking.Status !== 'confirmed') {
                return res.status(400).json({ message: 'Chỉ có thể check-in booking đã được xác nhận' });
            }

            booking.CheckInTime = new Date();
            booking.Status = 'checked-in';

            await booking.save();

            const table = await BilliardsTable.findById(booking.Table);
            if (table) {
                table.Status = 'occupied';
                await table.save();
            }

            res.json({ message: 'Check-in thành công' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    checkOut: async (req, res) => {
        try {
            const booking = await BilliardsBooking.findById(req.params.id).populate('Table');
            if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking' });

            if (booking.Status !== 'checked-in') {
                return res.status(400).json({ message: 'Chỉ có thể check-out sau khi đã check-in' });
            }

            booking.CheckOutTime = new Date();
            booking.Status = 'completed';

            // Tính thời gian thực tế sử dụng
            const actualHours = (booking.CheckOutTime - booking.CheckInTime) / (1000 * 60 * 60);

            // Lấy loại bàn thực tế đã đặt
            const tableType = booking.Table.Type;

            // Tìm bảng giá tương ứng
            const rate = await TableRate.findOne({ Club: booking.Club, Type: tableType });

            if (rate) {
                booking.TotalAmount = Math.ceil(actualHours * rate.PricePerHour);
            }

            await booking.save();

            // Cập nhật trạng thái bàn
            const table = await BilliardsTable.findById(booking.Table._id);
            if (table) {
                table.Status = 'available';
                await table.save();
            }

            res.json({ message: 'Check-out thành công', totalAmount: booking.TotalAmount });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    },


    getUserBookings: async (req, res) => {
        try {
            const role = req.user.role;
            const userId = req.user.id;
            const { status, clubId } = req.query;

            const allowedStatusesByRole = {
                user: ['pending', 'confirmed', 'completed'],
                partner: ['confirmed', 'checked-in', 'completed']
            };

            if (!allowedStatusesByRole[role]) {
                return res.status(403).json({ message: 'Không có quyền truy cập booking' });
            }
            const requestedStatuses = status
                ? status.split(',').map(s => s.trim())
                : allowedStatusesByRole[role];

            const invalidStatuses = requestedStatuses.filter(s => !allowedStatusesByRole[role].includes(s));
            if (invalidStatuses.length > 0) {
                return res.status(400).json({ message: `Trạng thái không hợp lệ: ${invalidStatuses.join(', ')}` });
            }
            const query = {
                Status: { $in: requestedStatuses }
            };
            if (role === 'user') {
                query.User = userId;
            } else if (role === 'partner') {
                if (!clubId) return res.status(400).json({ message: 'Thiếu clubId' });

                const club = await BilliardsClub.findOne({ _id: clubId, Owner: userId });
                if (!club) return res.status(403).json({ message: 'Bạn không sở hữu club này' });

                query.Club = clubId;
            }

            const bookings = await BilliardsBooking.find(query)
                .populate('User', 'Name Email Avatar')
                .populate('Table', 'TableNumber Type')
                .populate('Club', 'Name Address');

            return res.json({ bookings });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    },

    openNow: async (req, res) => {
        try {
            const { clubId, tableId, note } = req.body;
            const userId = req.user.id;

            if (!clubId || !tableId || !userId) {
                return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
            }

            // Lấy thông tin bàn để biết loại bàn
            const table = await BilliardsTable.findById(tableId);
            if (!table) return res.status(404).json({ message: 'Không tìm thấy bàn' });

            // Kiểm tra rate theo loại bàn và club
            const rate = await TableRate.findOne({ Club: clubId, Type: table.Type });
            if (!rate) return res.status(404).json({ message: `Không tìm thấy giá cho bàn loại ${table.Type}` });

            // Thời gian bắt đầu là thời điểm hiện tại (lấy từ server)
            const now = new Date();

            const booking = new BilliardsBooking({
                User: userId,
                Club: clubId,
                Table: tableId,
                StartTime: now,
                CheckInTime: now,
                Status: 'checked-in',
                Note: note || '',
                IsWalkIn: true,
            });

            await booking.save();

            // Cập nhật trạng thái bàn thành "occupied"
            table.Status = 'occupied';
            await table.save();

            res.status(201).json({
                message: 'Mở bàn thành công',
                booking,
            });
        } catch (error) {
            console.error('Lỗi khi mở bàn:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    endPlay: async (req, res) => {
        try {
            const { bookingId } = req.params;

            const booking = await BilliardsBooking.findById(bookingId).populate('Table');
            if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking' });

            if (booking.Status !== 'checked-in') {
                return res.status(400).json({ message: 'Chỉ có thể kết thúc booking đang hoạt động (checked-in)' });
            }

            const now = new Date();

            // Tính thời gian chơi (phút)
            const playDurationMinutes = Math.ceil((now - booking.CheckInTime) / 60000);

            // Lấy bảng giá tương ứng
            const rate = await TableRate.findOne({
                Club: booking.Club,
                Type: booking.Table.Type,
            });

            if (!rate) {
                return res.status(404).json({ message: `Không tìm thấy giá cho loại bàn ${booking.Table.Type}` });
            }

            // Tính tiền theo phút (PricePerHour từ model TableRate)
            const pricePerMinute = rate.PricePerHour / 60;
            const totalAmount = Math.ceil(pricePerMinute * playDurationMinutes);

            // Cập nhật booking
            booking.Status = 'completed';
            booking.CheckOutTime = now;
            booking.EndTime = now;
            booking.TotalAmount = totalAmount;

            await booking.save();

            // Cập nhật trạng thái bàn thành available
            const table = await BilliardsTable.findById(booking.Table._id);
            if (table) {
                table.Status = 'available';
                await table.save();
            }

            res.json({
                message: 'Kết thúc bàn thành công',
                totalAmount,
                playDurationMinutes,
                booking
            });
        } catch (error) {
            console.error('Lỗi khi kết thúc chơi:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    previewEndPlay: async (req, res) => {
        try {
            const { bookingId } = req.params;
            const booking = await BilliardsBooking.findById(bookingId).populate('Table');
            if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

            if (booking.Status !== 'checked-in') {
                return res.status(400).json({ message: 'Booking không đang trong trạng thái chơi' });
            }

            const now = new Date();
            const durationMs = now - booking.CheckInTime;
            const durationMinutes = Math.ceil(durationMs / (1000 * 60));

            const rate = await TableRate.findOne({ Club: booking.Club, Type: booking.Table.Type });
            if (!rate) {
                return res.status(404).json({ message: 'Không tìm thấy giá cho loại bàn' });
            }

            const pricePerMinute = rate.PricePerHour / 60;
            const totalAmountEstimate = Math.ceil(pricePerMinute * durationMinutes);

            return res.json({
                booking,
                durationMinutes,
                rate,
                totalAmountEstimate,
            });
        } catch (err) {
            console.error('previewEndPlay error:', err);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },
}

module.exports = BilliardsBookingController;