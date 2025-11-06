const cron = require('node-cron');
const { DateTime } = require('luxon');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const BilliardsClub = require('../models/BilliardsClub'); // ✅ thêm model quán bi-a

cron.schedule('0 0 * * *', async () => {
  try {
    const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    console.log(`🕓 [Cron] Kiểm tra gói hết hạn: ${now.toFormat('yyyy-MM-dd HH:mm:ss')}`);

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
        // 🟢 Nếu user còn gói khác đang hoạt động
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

        // ✅ Nếu user có gói 'partner', bật lại quán
        if (otherPlan.Type === 'partner') {
          await BilliardsClub.updateMany(
            { Owner: user._id },
            { IsActive: true }
          );
          console.log(`🏪 Quán của user ${user.Email} đã được kích hoạt lại.`);
        }

      } else {
        // 🔴 Không còn gói nào đang hoạt động
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

        // ✅ Vô hiệu hóa toàn bộ quán của người dùng này
        await BilliardsClub.updateMany(
          { Owner: user._id },
          { IsActive: false }
        );
        console.log(`🚫 Quán của user ${user.Email} đã bị tạm dừng do gói hết hạn.`);
      }

      await user.save();
      console.log(`⏰ Gói của user ${user.Email || user._id} đã hết hạn và được cập nhật.`);
    }

    console.log('✅ [Cron] Hoàn tất xử lý gói hết hạn.');
  } catch (err) {
    console.error('❌ [Cron] Lỗi khi xử lý gói hết hạn:', err);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });