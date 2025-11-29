const cron = require('node-cron');
const BilliardsBooking = require('../models/BilliardsBooking');
const BilliardsTable = require('../models/BilliardsTable');
const { DateTime } = require('luxon');

// Chạy mỗi 5 phút để tự động check-in các booking đã đến giờ bắt đầu
cron.schedule('*/5 * * * *', async () => {
    try {
        const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
        const currentDate = now.toISODate(); // YYYY-MM-DD
        const currentHour = now.hour;
        const currentMinute = now.minute;
        const currentTimeInHours = currentHour + currentMinute / 60;

        // Tìm các booking:
        // 1. Status là 'confirmed' (chưa check-in)
        // 2. BookingDate là hôm nay hoặc trong quá khứ
        // 3. StartHour đã đến (đã đến giờ bắt đầu)
        // 4. Chưa có CheckInTime (chưa được check-in thủ công)
        const bookingsToCheckIn = await BilliardsBooking.find({
            Status: 'confirmed',
            BookingDate: { $lte: currentDate },
            StartHour: { $lte: currentTimeInHours },
            $or: [
                { CheckInTime: { $exists: false } },
                { CheckInTime: null }
            ]
        }).populate('Table').populate('Club');

        let checkedInCount = 0;

        for (const booking of bookingsToCheckIn) {
            try {
                // Kiểm tra lại: nếu booking đã đến giờ bắt đầu
                const bookingDate = DateTime.fromISO(booking.BookingDate).setZone('Asia/Ho_Chi_Minh');
                const startDateTime = bookingDate.set({
                    hour: Math.floor(booking.StartHour),
                    minute: Math.round((booking.StartHour % 1) * 60),
                    second: 0,
                    millisecond: 0
                });

                // Nếu đã đến giờ bắt đầu
                if (now >= startDateTime) {
                    // Tự động check-in
                    booking.CheckInTime = now.toJSDate();
                    booking.Status = 'checked-in';
                    await booking.save();

                    // Cập nhật trạng thái bàn thành 'occupied'
                    if (booking.Table) {
                        const tableId = booking.Table._id || booking.Table;
                        const table = await BilliardsTable.findById(tableId);
                        if (table) {
                            // Chỉ update nếu bàn đang ở trạng thái 'reserved' hoặc 'available'
                            if (table.Status === 'reserved' || table.Status === 'available') {
                                table.Status = 'occupied';
                                await table.save();
                                console.log(`✅ Auto check-in booking ${booking._id} - Table ${table.TableNumber} (${table.Type}) is now occupied`);
                            } else {
                                console.log(`⚠️ Auto check-in booking ${booking._id} - Table ${table.TableNumber} is already ${table.Status}`);
                            }
                        }
                    } else {
                        console.log(`⚠️ Auto check-in booking ${booking._id} - No table assigned`);
                    }

                    checkedInCount++;
                }
            } catch (err) {
                console.error(`❌ Error processing booking ${booking._id}:`, err);
            }
        }

        if (checkedInCount > 0) {
            console.log(`[CRON] Auto check-in ${checkedInCount} booking(s) that reached start time`);
        }

    } catch (err) {
        console.error('[CRON ERROR] Failed to auto check-in bookings:', err);
    }
});

