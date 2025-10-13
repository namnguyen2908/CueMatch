const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');

function checkFeature(featureKey) {
  return async function (req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User ID missing from request' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!user.CurrentSubscription || !user.CurrentSubscription.IsActive) {
        return res.status(403).json({ message: 'You have not registered for any service package' });
      }
      const plan = await SubscriptionPlan.findById(user.CurrentSubscription.Plan);
      if (!plan) {
        return res.status(403).json({ message: 'Service package not found' });
      }

      const feature = plan.Features.find(f => f.Key === featureKey);
      if (!feature) {
        return res.status(403).json({ message: `Your package does not support the feature: ${featureKey}` });
      }
      let used = 0;
      if (user.UsageThisMonth instanceof Map) {
        used = user.UsageThisMonth.get(featureKey) || 0;
      } else {
        used = user.UsageThisMonth?.[featureKey] || 0;
      }

      if (feature.MonthlyLimit !== null && used >= feature.MonthlyLimit) {
        return res.status(403).json({ message: `You have used up all your ${featureKey} for the month` });
      }

      if (user.UsageThisMonth instanceof Map) {
        user.UsageThisMonth.set(featureKey, used + 1);
      } else {
        user.UsageThisMonth = user.UsageThisMonth || {};
        user.UsageThisMonth[featureKey] = used + 1;
      }
      await user.save();

      return next();

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'System error' });
    }
  };
}

module.exports = checkFeature;