const cron = require('node-cron');
const BilliardsBooking = require('../models/BilliardsBooking');
const BilliardsTable = require('../models/BilliardsTable');
const BilliardsClub = require('../models/BilliardsClub');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Chạy mỗi 5 phút để check các booking đã quá giờ
cron.schedule('*/1 * * * *', async () => {
    try {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInHours = currentHour + currentMinute / 60;

        // Tìm các booking:
        // 1. Status là 'confirmed' hoặc 'checked-in' (chưa completed)
        // 2. BookingDate là hôm nay hoặc trong quá khứ
        // 3. EndHour đã qua (đã quá giờ kết thúc)
        const bookingsToComplete = await BilliardsBooking.find({
            Status: { $in: ['confirmed', 'checked-in'] },
            BookingDate: { $lte: currentDate },
            EndHour: { $lt: currentTimeInHours }
        }).populate('Table').populate('Club');

        let completedCount = 0;

        for (const booking of bookingsToComplete) {
            try {
                // Kiểm tra lại: nếu booking đã quá giờ kết thúc mà chưa check-in
                // thì tự động đánh dấu là completed
                const bookingDate = new Date(booking.BookingDate);
                const endDateTime = new Date(bookingDate);
                endDateTime.setHours(Math.floor(booking.EndHour), Math.round((booking.EndHour % 1) * 60), 0, 0);

                // Nếu đã quá giờ kết thúc
                if (now > endDateTime) {
                    booking.Status = 'completed';
                    booking.CheckOutTime = endDateTime; // Set checkout time to scheduled end time
                    await booking.save();

                    // Add money to club owner's wallet when booking is completed
                    try {
                        const payment = await Payment.findOne({ Booking: booking._id, Status: 'PAID' });
                        if (payment) {
                            const club = await BilliardsClub.findById(booking.Club).populate('Owner');
                            if (club && club.Owner) {
                                const owner = await User.findById(club.Owner._id);
                                if (owner) {
                                    // Initialize wallet if not exists
                                    if (!owner.Wallet) {
                                        owner.Wallet = {
                                            Balance: 0,
                                            TotalEarned: 0,
                                            TotalWithdrawn: 0
                                        };
                                    }
                                    
                                    // Use booking.TotalAmount or payment.Amount
                                    const amountToAdd = booking.TotalAmount || payment.Amount;
                                    
                                    // Add money to wallet
                                    owner.Wallet.Balance = (owner.Wallet.Balance || 0) + amountToAdd;
                                    owner.Wallet.TotalEarned = (owner.Wallet.TotalEarned || 0) + amountToAdd;
                                    await owner.save();
                                    
                                    console.log(`💰 Added ${amountToAdd} VND to wallet of ${owner.Email} (booking ${booking._id} auto-completed). New balance: ${owner.Wallet.Balance} VND`);
                                }
                            }
                        }
                    } catch (walletError) {
                        console.error(`❌ Error adding money to owner wallet for booking ${booking._id}:`, walletError);
                    }

                    // Cập nhật trạng thái bàn nếu cần
                    if (booking.Table) {
                        const table = await BilliardsTable.findById(booking.Table._id);
                        if (table && (table.Status === 'reserved' || table.Status === 'occupied')) {
                            table.Status = 'available';
                            await table.save();
                        }
                    }

                    completedCount++;
                    console.log(`✅ Auto-completed booking ${booking._id} - User didn't check in before end time`);
                }
            } catch (err) {
                console.error(`❌ Error processing booking ${booking._id}:`, err);
            }
        }

        if (completedCount > 0) {
            console.log(`[CRON] Auto-completed ${completedCount} booking(s) that passed end time without check-in`);
        }

    } catch (err) {
        console.error('[CRON ERROR] Failed to auto-complete bookings:', err);
    }
});

