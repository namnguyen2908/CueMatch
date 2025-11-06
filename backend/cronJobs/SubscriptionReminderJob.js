const cron = require('node-cron');
const { DateTime } = require('luxon');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { sendSubscriptionReminderEmail } = require('../sendEmail');

cron.schedule('0 9 * * *', async () => {
  try {
    const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    const twoDaysLaterStart = now.plus({ days: 2 }).startOf('day');
    const twoDaysLaterEnd = now.plus({ days: 2 }).endOf('day');

    console.log(`📬 [Cron] Kiểm tra gói sắp hết hạn (${now.toFormat('yyyy-MM-dd HH:mm')})`);

    // Lọc những subscription còn hoạt động và sẽ hết hạn sau 2 ngày
    const upcomingExpirations = await Subscription.find({
      IsActive: true,
      EndDate: {
        $gte: twoDaysLaterStart.toJSDate(),
        $lte: twoDaysLaterEnd.toJSDate()
      },
      ReminderSent: false
    }).populate('User Plan');

    for (const sub of upcomingExpirations) {
      try {
        const user = await User.findById(sub.User);
        const plan = await SubscriptionPlan.findById(sub.Plan);
        if (!user || !plan) continue;

        const endDateFormatted = DateTime.fromJSDate(sub.EndDate, { zone: 'Asia/Ho_Chi_Minh' })
          .toFormat('dd/MM/yyyy');

        await sendSubscriptionReminderEmail({
          toEmail: user.Email,
          toName: user.Name,
          subject: '⏰ Gói dịch vụ của bạn sắp hết hạn',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #2c3e50;">⚠️ Gói dịch vụ sắp hết hạn</h2>
                <p>Xin chào <strong>${user.Name}</strong>,</p>
                <p>Gói <strong>${plan.Name}</strong> của bạn sẽ hết hạn vào ngày <strong>${endDateFormatted}</strong>.</p>
                <p>Hãy gia hạn ngay để không bị gián đoạn các tính năng cao cấp.</p>
                <a href="${process.env.CLIENT_URL}/subscription" style="display:inline-block;margin-top:20px;padding:10px 15px;background-color:#2c3e50;color:#fff;text-decoration:none;border-radius:5px;">Gia hạn ngay</a>
                <p style="margin-top: 40px; font-size: 0.9em; color: #888;">Email này được gửi tự động. Vui lòng không trả lời.</p>
            </div>
          `
        });

        sub.ReminderSent = true;
        await sub.save();
        console.log(`✅ Đã gửi email nhắc nhở hết hạn cho user: ${user.Email}`);
      } catch (err) {
        console.error(`❌ Lỗi khi gửi email cho ${sub.User}:`, err);
      }
    }
  } catch (err) {
    console.error('❌ [Cron] Lỗi khi gửi email nhắc hết hạn:', err);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });