const cron = require('node-cron');
const { DateTime } = require('luxon');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

async function sendReminderEmail({ toEmail, toName, planName, endDate }) {
  const mailOptions = {
    from: `"Support Team" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '⏰ Your subscription plan is about to expire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #2c3e50;">⚠️ Subscription Expiring Soon</h2>
        <p>Hello <strong>${toName}</strong>,</p>
        <p>Your subscription plan <strong>${planName}</strong> will expire on <strong>${endDate}</strong>.</p>
        <p>Please renew to avoid interruption of premium features.</p>
        <a href="${process.env.CLIENT_URL}/subscription" 
           style="display:inline-block;margin-top:20px;padding:10px 15px;
                  background-color:#2c3e50;color:#fff;text-decoration:none;border-radius:5px;">
           Renew Now
        </a>
        <p style="margin-top: 40px; font-size: 0.9em; color: #888;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

cron.schedule(
  '0 9 * * *',
  async () => {
    try {
      const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
      const twoDaysLaterStart = now.plus({ days: 2 }).startOf('day');
      const twoDaysLaterEnd = now.plus({ days: 2 }).endOf('day');

      console.log(`📬 [Cron] Checking subscriptions expiring soon (${now.toFormat('yyyy-MM-dd HH:mm')})`);

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

          await sendReminderEmail({
            toEmail: user.Email,
            toName: user.Name,
            planName: plan.Name,
            endDate: endDateFormatted
          });

          sub.ReminderSent = true;
          await sub.save();

          console.log(`✅ Reminder email sent to user: ${user.Email}`);
        } catch (err) {
          console.error(`❌ Error sending email for ${sub.User}:`, err.message);
        }
      }
    } catch (err) {
      console.error('❌ [Cron] Error sending subscription reminders:', err.message);
    }
  },
  { timezone: 'Asia/Ho_Chi_Minh' }
);