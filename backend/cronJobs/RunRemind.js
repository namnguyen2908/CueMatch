const cron = require('node-cron');
const { DateTime } = require('luxon');
const MatchInvitation = require('../models/MatchInvitation');
const User = require('../models/User');
const sendInvitationEmail = require('../sendEmail');

cron.schedule('*/5 * * * *', async () => {
    console.log(`[CronJob] Checking for upcoming matches at ${new Date().toISOString()}`);

    const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    const oneHourLater = now.plus({ hours: 1 });

    // Lấy ngày hôm nay
    const matchDate = oneHourLater.startOf('day').toJSDate();

    // Giờ bắt đầu (so sánh dưới dạng chuỗi HH:mm)
    const time = oneHourLater.toFormat('HH:mm');

    try {
        const matches = await MatchInvitation.find({
            MatchDate: matchDate,
            TimeStart: time,
            Status: 'Accepted',
            ReminderSent: { $ne: true } // Đảm bảo chỉ gửi một lần
        }).populate('From To');

        for (const match of matches) {
            const { From, To, MatchDate, TimeStart, TimeEnd, Location, PlayType, Message } = match;

            const formattedDate = DateTime.fromJSDate(MatchDate, { zone: 'Asia/Ho_Chi_Minh' }).toFormat('yyyy-MM-dd');

            // Gửi mail cho người gửi
            await sendInvitationEmail({
                toEmail: From.Email,
                toName: From.Name,
                fromName: 'Billiards Reminder',
                matchDate: formattedDate,
                timeStart: TimeStart,
                timeEnd: TimeEnd,
                location: Location,
                playType: PlayType,
                message: `🔔 Reminder: You have a match in 1 hour.\n\n${Message || ''}`
            });

            // Gửi mail cho người nhận
            await sendInvitationEmail({
                toEmail: To.Email,
                toName: To.Name,
                fromName: 'Billiards Reminder',
                matchDate: formattedDate,
                timeStart: TimeStart,
                timeEnd: TimeEnd,
                location: Location,
                playType: PlayType,
                message: `🔔 Reminder: You have a match in 1 hour.\n\n${Message || ''}`
            });

            // Đánh dấu là đã gửi để tránh gửi lại
            match.ReminderSent = true;
            await match.save();

            console.log(`✅ Sent reminder emails for match between ${From.Name} and ${To.Name}`);
        }
    } catch (err) {
        console.error('❌ Error in match reminder job:', err);
    }
});
