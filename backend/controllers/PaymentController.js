const Payment = require('../models/Payment');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

function generateOrderCode() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD${timestamp}${random}`;
}

const PaymentController = {
  createPaymentOrder: async (req, res) => {
    try {
      const { planId } = req.body;
      const userId = req.user.id;

      const plan = await SubscriptionPlan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Package does not exist' });
      }

      const orderCode = generateOrderCode();

      const payment = await Payment.create({
        User: userId,
        Plan: planId,
        OrderCode: orderCode,
        Amount: plan.Price,
        Description: `Package payment ${plan.Name}`,
        Status: 'PENDING',
      });

      const sepayAccount = process.env.SEPAY_ACC;
      const sepayBank = process.env.SEPAY_BANK;
      const qrUrl = `https://qr.sepay.vn/img?acc=${sepayAccount}&bank=${sepayBank}&amount=${plan.Price}&des=${orderCode}`;

      return res.json({
        message: 'Order created successfully',
        orderCode,
        amount: plan.Price,
        qrUrl,
      });
    } catch (error) {
      console.error('CreatePaymentOrder error:', error);
      return res.status(500).json({ message: 'Server error when creating order' });
    }
  },

  SepayWebhook: async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const expectedKey = process.env.SEPAY_API_KEY;

      if (!authHeader || !authHeader.startsWith('Apikey ')) {
        console.warn('Missing or incorrectly formatted Authorization header');
        return res.sendStatus(403);
      }

      const receivedKey = authHeader.split(' ')[1];
      if (receivedKey !== expectedKey) {
        console.warn('Invalid API Key');
        return res.sendStatus(403);
      }

      const data = req.body;
      console.log('📥 Webhook Sepay:', data);

      const { description, transferAmount } = data;
      if (!description) return res.sendStatus(200);

      const orderCodeMatch = description.match(/ORD\d+\d+/);
      const orderCode = orderCodeMatch ? orderCodeMatch[0] : null;

      if (!orderCode) {
        console.log('OrderCode not found in description:', description);
        return res.sendStatus(200);
      }

      const payment = await Payment.findOne({ OrderCode: orderCode });
      if (!payment) {
        console.log('No order found corresponding to orderCode:', orderCode);
        return res.sendStatus(200);
      }

      const isIncoming = data.transferType === 'in';
      const isAmountMatched = transferAmount === payment.Amount;

      if (isIncoming && isAmountMatched) {
        payment.Status = 'PAID';
        await payment.save();

        const plan = await SubscriptionPlan.findById(payment.Plan);
        if (!plan) {
          console.warn('Package not found when processing webhook for orderCode:', orderCode);
          return res.sendStatus(200);
        }

        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + plan.Duration);

        const newSub = await Subscription.create({
          User: payment.User,
          Plan: plan._id,
          StartDate: start,
          EndDate: end,
          IsActive: true,
        });

        const user = await User.findById(payment.User);
        if (user) {
          user.CurrentSubscription = {
            Plan: plan._id,
            StartDate: start,
            EndDate: end,
            IsActive: true
          };
          if (user.Role !== 'admin') {
            user.Role = plan.Type === 'partner' ? 'partner' : 'user';
          }

          user.UsageThisMonth = {};
          await user.save();
        }

        console.log(`Payment successful & activation of package ${plan.Name} for user ${payment.User}`);

      } else {
        console.warn(`Invalid transaction or wrong amount for orderCode: ${orderCode}`);
        await Payment.updateOne({ OrderCode: orderCode }, { Status: 'FAILED' });
      }

      return res.sendStatus(200);
    } catch (err) {
      console.error('Webhook error:', err);
      return res.sendStatus(500);
    }
  },


  getOrderStatus: async (req, res) => {
    try {
      const { orderCode } = req.params;

      const payment = await Payment.findOne({ OrderCode: orderCode });
      if (!payment) {
        return res.status(404).json({ message: 'Payment order not found' });
      }

      return res.json({
        status: payment.Status,
        amount: payment.Amount,
        planId: payment.Plan,
      });
    } catch (error) {
      console.error('getOrderStatus error:', error);
      return res.status(500).json({ message: 'Error checking payment status' });
    }
  },
};

module.exports = PaymentController;