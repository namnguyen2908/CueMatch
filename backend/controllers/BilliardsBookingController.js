const BilliardsBooking = require('../models/BilliardsBooking');
const BilliardsTable = require('../models/BilliardsTable');
const BilliardsClub = require('../models/BilliardsClub');
const TableRate = require('../models/TableRate');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { createNotification } = require('./NotificationController');
const mongoose = require('mongoose');

// Helper function to get socket.io instance
const getSocketIO = (req) => {
    return req.app.get('socketio');
};

// Helper function to add money to club owner's wallet when booking is completed
const addMoneyToOwnerWallet = async (booking) => {
    try {
        // Find payment associated with this booking
        const payment = await Payment.findOne({ Booking: booking._id, Status: 'PAID' });
        if (!payment) {
            console.log(`⚠️ No payment found for booking ${booking._id}`);
            return false;
        }

        // Check if money has already been added (by checking if there's a payment record with booking completed)
        // We'll use a flag or check the payment record
        // For now, we'll add money based on booking.TotalAmount
        
        // Get club and owner
        const club = await BilliardsClub.findById(booking.Club).populate('Owner');
        if (!club || !club.Owner) {
            console.log(`⚠️ Club or owner not found for booking ${booking._id}`);
            return false;
        }

        const owner = await User.findById(club.Owner._id);
        if (!owner) {
            console.log(`⚠️ Owner not found for booking ${booking._id}`);
            return false;
        }

        // Initialize wallet if not exists
        if (!owner.Wallet) {
            owner.Wallet = {
                Balance: 0,
                TotalEarned: 0,
                TotalWithdrawn: 0
            };
        }

        // Use booking.TotalAmount (which may have been recalculated) or payment.Amount
        const amountToAdd = booking.TotalAmount || payment.Amount;

        // Add money to wallet
        owner.Wallet.Balance = (owner.Wallet.Balance || 0) + amountToAdd;
        owner.Wallet.TotalEarned = (owner.Wallet.TotalEarned || 0) + amountToAdd;
        await owner.save();

        console.log(`💰 Added ${amountToAdd} VND to wallet of ${owner.Email} (booking ${booking._id} completed). New balance: ${owner.Wallet.Balance} VND`);
        return true;
    } catch (error) {
        console.error(`❌ Error adding money to owner wallet for booking ${booking._id}:`, error);
        return false;
    }
};

const BilliardsBookingController = {
     checkAvailable: async (req, res) => {
        try {
            const { clubId } = req.params;
            const { date, start, end } = req.query;

            // Validate clubId
            if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
                return res.status(400).json({ message: "Invalid club ID format" });
            }

            // Validate required parameters
            if (!date || !start || !end) {
                return res.status(400).json({ message: "Missing required parameters: date, start, end" });
            }

            // Validate date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD" });
            }

            // Validate date is not in the past
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                return res.status(400).json({ message: "Date cannot be in the past" });
            }

            // Validate start and end hours
            const startHour = Number(start);
            const endHour = Number(end);

            if (isNaN(startHour) || isNaN(endHour)) {
                return res.status(400).json({ message: "Start and end must be valid numbers" });
            }

            if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
                return res.status(400).json({ message: "Hours must be between 0 and 23" });
            }

            if (startHour >= endHour) {
                return res.status(400).json({ message: "Start hour must be less than end hour" });
            }

            const tables = await BilliardsTable.find({ Club: clubId });

            const result = {
                Pool: { total: 0, available: 0 },
                Carom: { total: 0, available: 0 },
                Snooker: { total: 0, available: 0 },
            };

            for (const table of tables) {
                const type = table.Type;
                result[type].total++;

                // Kiểm tra booking trùng giờ cùng ngày
                const isBooked = await BilliardsBooking.findOne({
                    Table: table._id,
                    BookingDate: date,
                    StartHour: { $lt: endHour },
                    EndHour: { $gt: startHour },
                    Status: { $in: ['pending', 'confirmed', 'checked-in'] }
                });

                if (!isBooked) {
                    result[type].available++;
                }
            }

            return res.json({ available: result });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    },

    // ============================================
    //  ĐẶT BÀN
    // ============================================
    bookTable: async (req, res) => {
        try {
            const { userId, clubId, type, bookingDate, startHour, endHour, note } = req.body;
            if (!userId || !clubId || !type || !bookingDate || startHour == null || endHour == null) {
                return res.status(400).json({ message: "Missing required fields: userId, clubId, type, bookingDate, startHour, endHour" });
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(400).json({ message: "Invalid user ID format" }); }
            if (!mongoose.Types.ObjectId.isValid(clubId)) { return res.status(400).json({ message: "Invalid club ID format" }); }
            const validTypes = ['Pool', 'Carom', 'Snooker'];
            if (!validTypes.includes(type)) {return res.status(400).json({ message: `Invalid table type. Must be one of: ${validTypes.join(', ')}` });}
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(bookingDate)) { return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD" }); }
            const startHourNum = Number(startHour);
            const endHourNum = Number(endHour);
            if (isNaN(startHourNum) || isNaN(endHourNum)) {return res.status(400).json({ message: "Start hour and end hour must be valid numbers" });}
            if (startHourNum < 0 || startHourNum > 23 || endHourNum < 0 || endHourNum > 23) {
                return res.status(400).json({ message: "Hours must be between 0 and 23" });
            }
            if (startHourNum >= endHourNum) { return res.status(400).json({ message: "End hour must be greater than start hour" }); }
            const selectedDate = new Date(bookingDate);
            const now = new Date();
            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(Math.floor(startHourNum), Math.round((startHourNum % 1) * 60), 0, 0);
            if (startDateTime < now) {return res.status(400).json({ message: "Cannot book a time slot in the past. Please select a future date and time." });}
            const club = await BilliardsClub.findById(clubId).populate('Owner');
            if (!club || !club.IsActive) { return res.status(400).json({ message: 'Invalid club or club is temporarily closed' }); }
            const tables = await BilliardsTable.find({ Club: clubId, Type: type });
            if (tables.length === 0) { return res.status(404).json({ message: 'No tables of this type available in the club' }); }
            let selectedTable = null;
            let booking = null;
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                for (const table of tables) {
                    const isBooked = await BilliardsBooking.findOne({
                        Table: table._id,
                        BookingDate: bookingDate,
                        StartHour: { $lt: endHourNum },
                        EndHour: { $gt: startHourNum },
                        Status: { $in: ['pending', 'confirmed', 'checked-in'] }
                    }).session(session);
                    if (!isBooked) {
                        selectedTable = table;
                        break;
                    }
                }
                if (!selectedTable) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(409).json({ message: 'No available tables for this time slot' });
                }
                const rate = await TableRate.findOne({ Club: clubId, Type: type }).session(session);
                if (!rate) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ message: 'No pricing table found for this table type' });
                }
                const hours = endHourNum - startHourNum;
                const totalAmount = Math.ceil(hours * rate.PricePerHour);
                booking = new BilliardsBooking({
                    User: userId,
                    Club: clubId,
                    Table: selectedTable._id,
                    BookingDate: bookingDate,
                    StartHour: startHourNum,
                    EndHour: endHourNum,
                    TotalAmount: totalAmount,
                    Note: note || "",
                    Status: "confirmed"
                });
                await booking.save({ session });
                await session.commitTransaction();
                session.endSession();
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                throw error;
            }
            if (club && club.Owner && club.Owner._id.toString() !== userId.toString()) {
                const notification = await createNotification( club.Owner._id, userId, 'new_booking', { bookingId: booking._id });
                const io = getSocketIO(req);
                if (io && notification) { io.to(`user:${club.Owner._id}`).emit('new_notification', notification); }
            }
            const io = getSocketIO(req);
            if (io) {
                io.to(`club:${clubId}`).emit('booking_updated', {
                    clubId,
                    bookingDate,
                    startHour: startHourNum,
                    endHour: endHourNum,
                    type,
                    action: 'booked'
                });
                io.to(`club:${clubId}`).emit('availability_changed', {
                    clubId,
                    bookingDate,
                    startHour: startHourNum,
                    endHour: endHourNum,
                    type
                });
            }
            return res.status(201).json({
                message: "Booking created successfully",
                booking
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    },

    cancelBooking: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Validate booking ID
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid booking ID format' });
            }

            const booking = await BilliardsBooking.findById(id).populate('User');

            if (!booking) return res.status(404).json({ message: 'Booking not found' });

            // Check if user owns this booking
            if (booking.User._id.toString() !== userId) {
                return res.status(403).json({ message: 'You do not have permission to cancel this booking' });
            }

            if (['cancelled', 'completed'].includes(booking.Status)) {
                return res.status(400).json({ message: 'Cannot cancel a booking that is already completed or cancelled' });
            }

            // Kiểm tra thời gian hủy: phải hủy trước 1 giờ so với giờ bắt đầu
            const now = new Date();
            const bookingDate = new Date(booking.BookingDate); // YYYY-MM-DD
            const startDateTime = new Date(bookingDate);
            startDateTime.setHours(booking.StartHour, 0, 0, 0); // Set giờ bắt đầu

            // Tính thời gian còn lại đến giờ bắt đầu (tính bằng milliseconds)
            const timeUntilStart = startDateTime - now;
            const oneHourInMs = 60 * 60 * 1000; // 1 giờ = 3600000 ms

            let refundAmount = 0;
            let isEligibleForRefund = false;

            // Nếu hủy trước 1 giờ so với giờ bắt đầu, được hoàn tiền
            if (timeUntilStart >= oneHourInMs) {
                isEligibleForRefund = true;
                refundAmount = booking.TotalAmount || 0;
            }

            // Sử dụng transaction để đảm bảo tính nhất quán
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Cập nhật trạng thái booking
            booking.Status = 'cancelled';
                await booking.save({ session });

                // Nếu được hoàn tiền, thêm tiền vào ví người dùng
                if (isEligibleForRefund && refundAmount > 0) {
                    const user = await User.findById(userId).session(session);
                    if (!user) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(404).json({ message: 'User not found' });
                    }

                    // Khởi tạo ví nếu chưa có
                    if (!user.Wallet) {
                        user.Wallet = {
                            Balance: 0,
                            TotalEarned: 0,
                            TotalWithdrawn: 0
                        };
                    }

                    // Thêm tiền hoàn lại vào ví
                    user.Wallet.Balance = (user.Wallet.Balance || 0) + refundAmount;
                    await user.save({ session });

                    // Tạo payment record cho refund
                    const refundOrderCode = `REFUND${Date.now()}${Math.floor(Math.random() * 1000)}`;
                    const refundPayment = new Payment({
                        User: userId,
                        Booking: booking._id,
                        Type: 'booking',
                        OrderCode: refundOrderCode,
                        Amount: refundAmount,
                        Status: 'PAID', // Refund được xử lý ngay lập tức
                        Description: `Refund for cancelled booking ${booking._id} - ${refundOrderCode}`
                    });
                    await refundPayment.save({ session });

                    console.log(`💰 Refunded ${refundAmount} VND to user ${user.Email} for cancelled booking ${booking._id}`);
                }

            // Cập nhật trạng thái bàn nếu cần
                const table = await BilliardsTable.findById(booking.Table).session(session);
            if (table && table.Status === 'reserved') {
                table.Status = 'available';
                    await table.save({ session });
            }

                await session.commitTransaction();
                session.endSession();

            // Broadcast booking cancellation để cập nhật availability real-time
            const io = getSocketIO(req);
            if (io && table) {
                io.to(`club:${booking.Club}`).emit('booking_updated', {
                    clubId: booking.Club,
                    bookingDate: booking.BookingDate,
                    startHour: booking.StartHour,
                    endHour: booking.EndHour,
                    type: table.Type,
                    action: 'cancelled'
                });

                io.to(`club:${booking.Club}`).emit('availability_changed', {
                    clubId: booking.Club,
                    bookingDate: booking.BookingDate,
                    startHour: booking.StartHour,
                    endHour: booking.EndHour,
                    type: table.Type
                });
            }

                const responseMessage = isEligibleForRefund 
                    ? `Booking cancelled successfully. Refund of ${refundAmount.toLocaleString()} VND has been added to your wallet.`
                    : 'Booking cancelled successfully. No refund available (cancellation must be made at least 1 hour before start time).';

                res.json({ 
                    message: responseMessage,
                    refunded: isEligibleForRefund,
                    refundAmount: isEligibleForRefund ? refundAmount : 0
                });
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                throw error;
            }
        } catch (err) {
            console.error('Cancel booking error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    checkIn: async (req, res) => {
        try {
            const { id } = req.params;

            // Validate booking ID
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid booking ID format' });
            }

            const booking = await BilliardsBooking.findById(id);
            if (!booking) return res.status(404).json({ message: 'Booking not found' });

            if (booking.Status !== 'confirmed') {
                return res.status(400).json({ message: 'Can only check-in a confirmed booking' });
            }

            booking.CheckInTime = new Date();
            booking.Status = 'checked-in';

            await booking.save();

            const table = await BilliardsTable.findById(booking.Table);
            if (table) {
                table.Status = 'occupied';
                await table.save();
            }

            res.json({ message: 'Check-in successful' });
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    checkOut: async (req, res) => {
        try {
            const { id } = req.params;

            // Validate booking ID
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid booking ID format' });
            }

            const booking = await BilliardsBooking.findById(id).populate('Table');
            if (!booking) return res.status(404).json({ message: 'Booking not found' });

            if (booking.Status !== 'checked-in') {
                return res.status(400).json({ message: 'Can only check-out after check-in' });
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

            // Add money to club owner's wallet when booking is completed
            await addMoneyToOwnerWallet(booking);

            // Cập nhật trạng thái bàn
            const table = await BilliardsTable.findById(booking.Table._id);
            if (table) {
                table.Status = 'available';
                await table.save();
            }

            res.json({ message: 'Check-out successful', totalAmount: booking.TotalAmount });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },


    getUserBookings: async (req, res) => {
        try {
            const role = req.user.role;
            const userId = req.user.id;
            const { status, clubId } = req.query;

            const allowedStatusesByRole = {
                user: ['pending', 'confirmed', 'completed', 'cancelled'],
                partner: ['confirmed', 'checked-in', 'completed']
            };

            if (!allowedStatusesByRole[role]) {
                return res.status(403).json({ message: 'No permission to access bookings' });
            }
            const requestedStatuses = status
                ? status.split(',').map(s => s.trim())
                : allowedStatusesByRole[role];

            const invalidStatuses = requestedStatuses.filter(s => !allowedStatusesByRole[role].includes(s));
            if (invalidStatuses.length > 0) {
                return res.status(400).json({ message: `Invalid status values: ${invalidStatuses.join(', ')}` });
            }
            const query = {
                Status: { $in: requestedStatuses }
            };
            if (role === 'user') {
                query.User = userId;
            } else if (role === 'partner') {
                if (!clubId) return res.status(400).json({ message: 'clubId is required' });

                // Validate clubId format
                if (!mongoose.Types.ObjectId.isValid(clubId)) {
                    return res.status(400).json({ message: 'Invalid club ID format' });
                }

                const club = await BilliardsClub.findOne({ _id: clubId, Owner: userId });
                if (!club) return res.status(403).json({ message: 'You do not own this club' });

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

            // Validate required fields
            if (!clubId || !tableId || !userId) {
                return res.status(400).json({ message: 'Missing required fields: clubId, tableId' });
            }

            // Validate ObjectId formats
            if (!mongoose.Types.ObjectId.isValid(clubId)) {
                return res.status(400).json({ message: 'Invalid club ID format' });
            }
            if (!mongoose.Types.ObjectId.isValid(tableId)) {
                return res.status(400).json({ message: 'Invalid table ID format' });
            }

            // Lấy thông tin bàn để biết loại bàn
            const table = await BilliardsTable.findById(tableId);
            if (!table) return res.status(404).json({ message: 'Table not found' });

            // Kiểm tra rate theo loại bàn và club
            const rate = await TableRate.findOne({ Club: clubId, Type: table.Type });
            if (!rate) return res.status(404).json({ message: `No pricing found for table type ${table.Type}` });

            // Thời gian bắt đầu là thời điểm hiện tại (lấy từ server)
            const now = new Date();
            
            // Format BookingDate: YYYY-MM-DD
            const bookingDate = now.toISOString().split('T')[0];
            
            // Lấy giờ hiện tại (0-23)
            const startHour = now.getHours();
            
            // EndHour có thể để null hoặc set một giá trị tạm thời, sẽ được cập nhật khi endPlay
            // Hoặc có thể set bằng startHour + 1 để tránh lỗi validation, nhưng tốt nhất là để null nếu model cho phép
            // Vì đây là walk-in, EndHour sẽ được cập nhật khi kết thúc

            const booking = new BilliardsBooking({
                User: userId,
                Club: clubId,
                Table: tableId,
                BookingDate: bookingDate,  // YYYY-MM-DD
                StartHour: startHour,      // 0-23
                EndHour: startHour + 1,    // Tạm thời set, sẽ được cập nhật khi endPlay
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
                message: 'Table opened successfully',
                booking,
            });
        } catch (error) {
            console.error('Error opening table:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    endPlay: async (req, res) => {
        try {
            const { bookingId } = req.params;

            // Validate booking ID
            if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ message: 'Invalid booking ID format' });
            }

            const booking = await BilliardsBooking.findById(bookingId).populate('Table');
            if (!booking) return res.status(404).json({ message: 'Booking not found' });

            if (booking.Status !== 'checked-in') {
                return res.status(400).json({ message: 'Can only end an active booking (checked-in)' });
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
                return res.status(404).json({ message: `No pricing found for table type ${booking.Table.Type}` });
            }

            // Tính tiền theo phút (PricePerHour từ model TableRate)
            const pricePerMinute = rate.PricePerHour / 60;
            const totalAmount = Math.ceil(pricePerMinute * playDurationMinutes);

            // Cập nhật EndHour với giờ hiện tại
            booking.EndHour = now.getHours();
            booking.Status = 'completed';
            booking.CheckOutTime = now;
            booking.TotalAmount = totalAmount;

            await booking.save();

            // Add money to club owner's wallet when booking is completed
            await addMoneyToOwnerWallet(booking);

            // Cập nhật trạng thái bàn thành available
            const table = await BilliardsTable.findById(booking.Table._id);
            if (table) {
                table.Status = 'available';
                await table.save();
            }

            res.json({
                message: 'Play ended successfully',
                totalAmount,
                playDurationMinutes,
                booking
            });
        } catch (error) {
            console.error('Error ending play:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    previewEndPlay: async (req, res) => {
        try {
            const { bookingId } = req.params;

            // Validate booking ID
            if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ message: 'Invalid booking ID format' });
            }

            const booking = await BilliardsBooking.findById(bookingId).populate('Table');
            if (!booking) return res.status(404).json({ message: 'Booking not found' });

            if (booking.Status !== 'checked-in') {
                return res.status(400).json({ message: 'Booking is not in active play status' });
            }

            const now = new Date();
            const durationMs = now - booking.CheckInTime;
            const durationMinutes = Math.ceil(durationMs / (1000 * 60));

            const rate = await TableRate.findOne({ Club: booking.Club, Type: booking.Table.Type });
            if (!rate) {
                return res.status(404).json({ message: 'No pricing found for table type' });
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
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    getDashboardStats: async (req, res) => {
        try {
            const userId = req.user.id;
            const { clubId } = req.query;
            
            // Nếu không có clubId trong query, lấy từ clubs của user
            let finalClubId = clubId;
            if (!finalClubId) {
                const userClubs = await BilliardsClub.find({ Owner: userId });
                if (userClubs.length > 0) {
                    finalClubId = userClubs[0]._id;
                } else {
                    return res.status(404).json({ message: 'You do not have any clubs yet' });
                }
            }

            // Validate clubId format if provided
            if (clubId && !mongoose.Types.ObjectId.isValid(clubId)) {
                return res.status(400).json({ message: 'Invalid club ID format' });
            }

            const club = await BilliardsClub.findOne({ _id: finalClubId, Owner: userId });
            if (!club) return res.status(403).json({ message: 'You do not own this club' });

            // Lấy tất cả booking completed
            const completedBookings = await BilliardsBooking.find({
                Club: finalClubId,
                Status: 'completed'
            })
                .populate('User', 'Name Email Avatar')
                .populate('Table', 'TableNumber Type')
                .sort({ CheckOutTime: -1 });

            // Tính toán doanh thu
            const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.TotalAmount || 0), 0);

            // Doanh thu theo ngày/tuần/tháng
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeek = new Date(today);
            thisWeek.setDate(today.getDate() - today.getDay()); // Start of week
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const revenueToday = completedBookings
                .filter(b => b.CheckOutTime && new Date(b.CheckOutTime) >= today)
                .reduce((sum, b) => sum + (b.TotalAmount || 0), 0);

            const revenueThisWeek = completedBookings
                .filter(b => b.CheckOutTime && new Date(b.CheckOutTime) >= thisWeek)
                .reduce((sum, b) => sum + (b.TotalAmount || 0), 0);

            const revenueThisMonth = completedBookings
                .filter(b => b.CheckOutTime && new Date(b.CheckOutTime) >= thisMonth)
                .reduce((sum, b) => sum + (b.TotalAmount || 0), 0);

            // Thống kê loại bàn
            const tableTypeStats = {
                Pool: { count: 0, revenue: 0 },
                Carom: { count: 0, revenue: 0 },
                Snooker: { count: 0, revenue: 0 }
            };

            completedBookings.forEach(booking => {
                if (booking.Table && booking.Table.Type) {
                    const type = booking.Table.Type;
                    if (tableTypeStats[type]) {
                        tableTypeStats[type].count++;
                        tableTypeStats[type].revenue += booking.TotalAmount || 0;
                    }
                }
            });

            // Lấy thông tin khách hàng (top 10 khách hàng đã đến nhiều nhất)
            const customerMap = new Map();
            completedBookings.forEach(booking => {
                if (booking.User) {
                    const userId = booking.User._id.toString();
                    if (!customerMap.has(userId)) {
                        customerMap.set(userId, {
                            user: booking.User,
                            visitCount: 0,
                            totalSpent: 0,
                            lastVisit: booking.CheckOutTime
                        });
                    }
                    const customer = customerMap.get(userId);
                    customer.visitCount++;
                    customer.totalSpent += booking.TotalAmount || 0;
                    if (new Date(booking.CheckOutTime) > new Date(customer.lastVisit)) {
                        customer.lastVisit = booking.CheckOutTime;
                    }
                }
            });

            const topCustomers = Array.from(customerMap.values())
                .sort((a, b) => b.visitCount - a.visitCount)
                .slice(0, 10);

            // Số bàn đang chơi
            const activeBookings = await BilliardsBooking.countDocuments({
                Club: finalClubId,
                Status: 'checked-in'
            });

            // Số booking đã đặt (confirmed)
            const confirmedBookings = await BilliardsBooking.countDocuments({
                Club: finalClubId,
                Status: 'confirmed'
            });

            res.json({
                totalRevenue,
                revenueToday,
                revenueThisWeek,
                revenueThisMonth,
                tableTypeStats,
                topCustomers,
                activeBookings,
                confirmedBookings,
                totalBookings: completedBookings.length
            });
        } catch (err) {
            console.error('getDashboardStats error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    getRevenueByTime: async (req, res) => {
        try {
            const userId = req.user.id;
            const { clubId, period } = req.query; // period: 'day', 'week', 'month'

            // Validate period
            if (!period || !['day', 'week', 'month'].includes(period)) {
                return res.status(400).json({ message: 'Period must be one of: day, week, month' });
            }

            let finalClubId = clubId;
            if (!finalClubId) {
                const userClubs = await BilliardsClub.find({ Owner: userId });
                if (userClubs.length > 0) {
                    finalClubId = userClubs[0]._id;
                } else {
                    return res.status(404).json({ message: 'You do not have any clubs yet' });
                }
            }

            // Validate clubId format if provided
            if (clubId && !mongoose.Types.ObjectId.isValid(clubId)) {
                return res.status(400).json({ message: 'Invalid club ID format' });
            }

            const club = await BilliardsClub.findOne({ _id: finalClubId, Owner: userId });
            if (!club) return res.status(403).json({ message: 'You do not own this club' });

            const completedBookings = await BilliardsBooking.find({
                Club: finalClubId,
                Status: 'completed',
                CheckOutTime: { $exists: true, $ne: null }
            })
                .select('CheckOutTime TotalAmount')
                .sort({ CheckOutTime: 1 });

            const revenueData = [];
            const now = new Date();

            if (period === 'day') {
                // Lấy doanh thu 30 ngày gần nhất
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    const nextDate = new Date(date);
                    nextDate.setDate(nextDate.getDate() + 1);

                    const revenue = completedBookings
                        .filter(b => {
                            const checkoutDate = new Date(b.CheckOutTime);
                            return checkoutDate >= date && checkoutDate < nextDate;
                        })
                        .reduce((sum, b) => sum + (b.TotalAmount || 0), 0);

                    revenueData.push({
                        date: date.toISOString().split('T')[0],
                        label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                        revenue
                    });
                }
            } else if (period === 'week') {
                // Lấy doanh thu 12 tuần gần nhất
                for (let i = 11; i >= 0; i--) {
                    const weekStart = new Date(now);
                    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() === 0 ? 7 : weekStart.getDay()) - (i * 7));
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 7);

                    const revenue = completedBookings
                        .filter(b => {
                            const checkoutDate = new Date(b.CheckOutTime);
                            return checkoutDate >= weekStart && checkoutDate < weekEnd;
                        })
                        .reduce((sum, b) => sum + (b.TotalAmount || 0), 0);

                    const weekLabel = `${weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${new Date(weekEnd.getTime() - 1).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
                    revenueData.push({
                        date: weekStart.toISOString().split('T')[0],
                        label: weekLabel,
                        revenue
                    });
                }
            } else if (period === 'month') {
                // Lấy doanh thu 12 tháng gần nhất
                for (let i = 11; i >= 0; i--) {
                    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

                    const revenue = completedBookings
                        .filter(b => {
                            const checkoutDate = new Date(b.CheckOutTime);
                            return checkoutDate >= monthStart && checkoutDate < monthEnd;
                        })
                        .reduce((sum, b) => sum + (b.TotalAmount || 0), 0);

                    revenueData.push({
                        date: monthStart.toISOString().split('T')[0],
                        label: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
                        revenue
                    });
                }
            }

            res.json({ revenueData });
        } catch (err) {
            console.error('getRevenueByTime error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },
}

module.exports = BilliardsBookingController;