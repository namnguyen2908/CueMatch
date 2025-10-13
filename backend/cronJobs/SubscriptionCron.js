const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { DateTime } = require('luxon');

cron.schedule('0 0 * * *', async () => {
  try {
    const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    console.log(`🕓 Cron chạy lúc: ${now.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')}`);

    const expiredSubs = await Subscription.find({
      EndDate: { $lt: now.toJSDate() },
      IsActive: true
    });

    for (const sub of expiredSubs) {
      sub.IsActive = false;
      await sub.save();

      const user = await User.findById(sub.User);
      if (!user) continue;

      const otherActive = await Subscription.findOne({
        User: sub.User,
        IsActive: true,
        _id: { $ne: sub._id }
      }).sort({ EndDate: -1 });

      if (otherActive) {
        const otherPlan = await SubscriptionPlan.findById(otherActive.Plan);
        user.CurrentSubscription = {
          Plan: otherActive.Plan,
          StartDate: otherActive.StartDate,
          EndDate: otherActive.EndDate,
          IsActive: true
        };
        if (user.Role !== 'admin') {
          user.Role = otherPlan.Type === 'partner' ? 'partner' : 'user';
        }
      } else {
        user.CurrentSubscription = {
          Plan: null,
          StartDate: null,
          EndDate: null,
          IsActive: false
        };
        if (user.Role !== 'admin') {
          user.Role = 'user';
        }
        user.UsageThisMonth = {};
      }

      await user.save();
      console.log(`⏰ Gói của user ${user._id} đã được xử lý hết hạn.`);
    }

    console.log('✅ Cron: Hoàn tất kiểm tra gói hết hạn.');
  } catch (err) {
    console.error('❌ Cron error:', err);
  }
});