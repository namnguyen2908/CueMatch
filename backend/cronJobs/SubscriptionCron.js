const cron = require('node-cron');
const { DateTime } = require('luxon');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const BilliardsClub = require('../models/BilliardsClub'); // ✅ thêm model quán bi-a

cron.schedule('0 0 * * *', async () => {
  try {
    const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    console.log(`🕓 [Cron] Check for expired packages: ${now.toFormat('yyyy-MM-dd HH:mm:ss')}`);
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
        if (user.Role !== 'admin') { user.Role = otherPlan.Type === 'partner' ? 'partner' : 'user'; }
        if (otherPlan.Type === 'partner') {
          await BilliardsClub.updateMany(
            { Owner: user._id },
            { IsActive: true }
          );
          console.log(`User ${user.Email}'s account has been reactivated.`);
        }
      } else {
        user.CurrentSubscription = {
          Plan: null,
          StartDate: null,
          EndDate: null,
          IsActive: false
        };
        if (user.Role !== 'admin') { user.Role = 'user'; }
        user.UsageThisMonth = {};
        await BilliardsClub.updateMany(
          { Owner: user._id },
          { IsActive: false }
        );
        console.log(`User ${user.Email}'s shop has been suspended due to package expiration.`);
      }

      await user.save();
      console.log(`User ${user.Email || user._id}'s package has expired and is being updated.`);
    }

    console.log('✅ [Cron] Finish processing expired packages.');
  } catch (err) {
    console.error('❌ [Cron] Error when processing expired package:', err);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });