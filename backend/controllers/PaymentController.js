const Payment = require('../models/Payment');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const BilliardsClub = require('../models/BilliardsClub');
const BilliardsBooking = require('../models/BilliardsBooking');
const { queueDashboardUpdate } = require('../services/adminDashboardService');

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
    const getSocketIO = () => {
      try { return req.app?.get('socketio'); } 
      catch (e) { return null; }};
    try {
      const authHeader = req.headers['authorization'];
      const expectedKey = process.env.SEPAY_API_KEY;
      if (!authHeader || !authHeader.startsWith('Apikey ')) return res.sendStatus(403);
      const receivedKey = authHeader.split(' ')[1];
      if (receivedKey !== expectedKey) return res.sendStatus(403);
      const data = req.body;
      const { description, transferAmount, transferType } = data;
      if (!description) return res.sendStatus(200);
      const orderCodeMatch = description.match(/ORD\d+\d+/);
      const orderCode = orderCodeMatch ? orderCodeMatch[0] : null;
      if (!orderCode) return res.sendStatus(200);
      const payment = await Payment.findOne({ OrderCode: orderCode });
      if (!payment) return res.sendStatus(200);
      const isIncoming = transferType === 'in';
      const isAmountMatched = transferAmount === payment.Amount;
      if (isIncoming && isAmountMatched) {
        payment.Status = 'PAID';
        await payment.save();
        const user = await User.findById(payment.User);
        if (!user) return res.sendStatus(200);
        if (payment.Type === 'booking' && payment.BookingData) {
          const BilliardsBookingController = require('./BilliardsBookingController');
          const bookingData = payment.BookingData;
          try {
            const session = await require('mongoose').startSession();
            session.startTransaction();
            try {
              const BilliardsTable = require('../models/BilliardsTable');
              const TableRate = require('../models/TableRate');
              const tables = await BilliardsTable.find({ 
                Club: bookingData.clubId, 
                Type: bookingData.tableType 
              }).session(session);
              if (tables.length === 0) {
                await session.abortTransaction();
                session.endSession();
                console.error('No tables available for booking');
                return res.sendStatus(200);
              }
              let selectedTable = null;
              for (const table of tables) {
                const isBooked = await BilliardsBooking.findOne({
                  Table: table._id,
                  BookingDate: bookingData.bookingDate,
                  StartHour: { $lt: bookingData.endHour },
                  EndHour: { $gt: bookingData.startHour },
                  Status: { $in: ['pending', 'confirmed', 'checked-in'] }
                }).session(session);
                if (!isBooked) {
                  selectedTable = table;
                  break;
                }
              }
              if (!selectedTable) {
                await session.abortTransaction();
                session.endSession();
                console.error('No available tables for booking');
                return res.sendStatus(200);
              }
              const club = await BilliardsClub.findById(bookingData.clubId).populate('Owner').session(session);
              if (!club || !club.Owner) {
                await session.abortTransaction();
                session.endSession();
                console.error('Club or owner not found');
                return res.sendStatus(200);
              }
              const booking = new BilliardsBooking({
                User: payment.User,
                Club: bookingData.clubId,
                Table: selectedTable._id,
                BookingDate: bookingData.bookingDate,
                StartHour: bookingData.startHour,
                EndHour: bookingData.endHour,
                TotalAmount: payment.Amount,
                Note: bookingData.note || "",
                Status: "confirmed"
              });
              await booking.save({ session });
              payment.Booking = booking._id;
              await payment.save({ session });
              await session.commitTransaction();
              session.endSession();
              try {
                const io = getSocketIO();
                if (io) {
                io.to(`club:${bookingData.clubId}`).emit('booking_updated', {
                  clubId: bookingData.clubId,
                  bookingDate: bookingData.bookingDate,
                  startHour: bookingData.startHour,
                  endHour: bookingData.endHour,
                  type: bookingData.tableType,
                  action: 'booked'
                });
                io.to(`club:${bookingData.clubId}`).emit('availability_changed', {
                  clubId: bookingData.clubId,
                  bookingDate: bookingData.bookingDate,
                  startHour: bookingData.startHour,
                  endHour: bookingData.endHour,
                  type: bookingData.tableType
                });
                }
              } catch (socketError) {
                console.error('Socket broadcast error:', socketError);
              }
              console.log(`✅ Booking created for user ${user.Email} - Order: ${orderCode}`);
            } catch (error) {
              await session.abortTransaction();
              session.endSession();
              console.error('Error creating booking:', error);
            }
          } catch (error) {
            console.error('Error processing booking payment:', error);
          }
        } else if (payment.Type === 'subscription' && payment.Plan) {
          const plan = await SubscriptionPlan.findById(payment.Plan);
          if (!plan) return res.sendStatus(200);
          const now = new Date();
          let sub = await Subscription.findOne({
            User: user._id,
            Plan: plan._id,
            IsActive: true
          });
          if (sub) {
            const currentEnd = new Date(sub.EndDate);
            const baseDate = currentEnd > now ? currentEnd : now;
            const newEnd = new Date(baseDate);
            newEnd.setDate(newEnd.getDate() + plan.Duration);
            sub.EndDate = newEnd;
            sub.IsActive = true;
            await sub.save();
            user.CurrentSubscription.EndDate = newEnd;
            user.CurrentSubscription.IsActive = true;
            await user.save();
            console.log(`🔁 Renewed plan ${plan.Name} for user ${user.Email} until ${newEnd}`);
          } else {
            const start = now;
            const end = new Date();
            end.setDate(start.getDate() + plan.Duration);
            sub = await Subscription.create({
              User: user._id,
              Plan: plan._id,
              StartDate: start,
              EndDate: end,
              IsActive: true
            });
            user.CurrentSubscription = {
              Plan: plan._id,
              StartDate: start,
              EndDate: end,
              IsActive: true
            };
            if (user.Role !== 'admin') {
              user.Role = plan.Type === 'partner' ? 'partner' : 'user';
            }
            await user.save();
            console.log(`🆕 Activated new plan ${plan.Name} for user ${user.Email}`);
          }
          if (plan.Type === 'partner') {
            const club = await BilliardsClub.findOne({ Owner: user._id });
            if (club) {
              club.IsActive = true;
              await club.save();
              console.log(`🏠 Club ${club.Name} of ${user.Email} has been reactivated.`);
            }
          }
          queueDashboardUpdate(req.app);
        }
      } else {
        await Payment.updateOne({ OrderCode: orderCode }, { Status: 'FAILED' });
        console.warn(`❌ Invalid payment for orderCode: ${orderCode}`);
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

  renewSubscription: async (req, res) => {
    try {
      const { planId } = req.body;
      const userId = req.user.id;

      const plan = await SubscriptionPlan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Package does not exist' });
      }

      // ✅ Check if user has active subscription of the same plan
      const currentSub = await Subscription.findOne({
        User: userId,
        Plan: planId,
        IsActive: true
      });

      const orderCode = generateOrderCode();

      const payment = await Payment.create({
        User: userId,
        Plan: planId,
        OrderCode: orderCode,
        Amount: plan.Price,
        Description: currentSub
          ? `Renew subscription ${plan.Name}`
          : `Purchase subscription ${plan.Name}`,
        Status: 'PENDING',
        Type: currentSub ? 'RENEWAL' : 'NEW'
      });

      const sepayAccount = process.env.SEPAY_ACC;
      const sepayBank = process.env.SEPAY_BANK;
      const qrUrl = `https://qr.sepay.vn/img?acc=${sepayAccount}&bank=${sepayBank}&amount=${plan.Price}&des=${orderCode}`;

      return res.json({
        message: currentSub
          ? 'Renewal order created successfully'
          : 'New subscription order created successfully',
        orderCode,
        amount: plan.Price,
        qrUrl
      });
    } catch (error) {
      console.error('RenewSubscription error:', error);
      return res.status(500).json({ message: 'Server error when creating renewal order' });
    }
  },

  getSubscriptionStatus: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).populate('CurrentSubscription.Plan');

      if (!user || !user.CurrentSubscription || !user.CurrentSubscription.Plan) {
        return res.json({
          hasSubscription: false,
          message: 'User does not have any subscription.'
        });
      }

      const now = new Date();
      const { StartDate, EndDate, Plan, IsActive } = user.CurrentSubscription;
      const remainingDays = Math.ceil((new Date(EndDate) - now) / (1000 * 60 * 60 * 24));

      let statusMessage = '';
      if (!IsActive) {
        statusMessage = 'Subscription has expired';
      } else if (remainingDays <= 3) {
        statusMessage = `Expiring soon (${remainingDays} days left)`;
      } else {
        statusMessage = `Active (${remainingDays} days left)`;
      }

      return res.json({
        hasSubscription: true,
        planName: Plan.Name,
        startDate: StartDate,
        endDate: EndDate,
        remainingDays,
        statusMessage
      });
    } catch (err) {
      console.error('getSubscriptionStatus error:', err);
      return res.status(500).json({ message: 'Error fetching subscription status' });
    }
  },

  // Get user transactions list with pagination
  getUserTransactions: async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status; // PENDING, PAID, FAILED
      const skip = (page - 1) * limit;

      // Build query
      const query = { User: userId };
      if (status && ['PENDING', 'PAID', 'FAILED'].includes(status.toUpperCase())) {
        query.Status = status.toUpperCase();
      }

      // Get total number of transactions
      const total = await Payment.countDocuments(query);

      // Get transactions list with populated Plan
      const transactions = await Payment.find(query)
        .populate('Plan', 'Name Price Duration Type')
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit)
        .select('-__v');

      return res.json({
        success: true,
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('getUserTransactions error:', error);
      return res.status(500).json({ message: 'Error fetching transactions list' });
    }
  },

  // Get transaction details by ID
  getTransactionById: async (req, res) => {
    try {
      const userId = req.user.id;
      const { transactionId } = req.params;

      const transaction = await Payment.findById(transactionId)
        .populate('Plan', 'Name Price Duration Type Description')
        .populate('User', 'Email FullName')
        .select('-__v');

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Check if transaction belongs to current user
      if (transaction.User._id.toString() !== userId) {
        return res.status(403).json({ message: 'You do not have permission to view this transaction' });
      }

      return res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('getTransactionById error:', error);
      return res.status(500).json({ message: 'Error fetching transaction details' });
    }
  },

  // Create payment order for booking
  createBookingPaymentOrder: async (req, res) => {
    try {
      const { bookingData } = req.body; // Contains: clubId, type, bookingDate, startHour, endHour, note
      const userId = req.user.id;

      if (!bookingData || !bookingData.clubId || (!bookingData.type && !bookingData.tableType) || !bookingData.bookingDate || 
          bookingData.startHour == null || bookingData.endHour == null) {
        return res.status(400).json({ message: 'Missing required booking data' });
      }

      // Frontend sends 'type', but we store as 'tableType' in database
      const type = bookingData.type || bookingData.tableType;
      const { clubId, bookingDate, startHour, endHour, note } = bookingData;

      // Validate club
      const club = await BilliardsClub.findById(clubId);
      if (!club || !club.IsActive) {
        return res.status(400).json({ message: 'Invalid club or club is temporarily closed' });
      }

      // Get table rate to calculate amount
      const TableRate = require('../models/TableRate');
      const rate = await TableRate.findOne({ Club: clubId, Type: type });
      if (!rate) {
        return res.status(400).json({ message: 'No pricing table found for this table type' });
      }

      const hours = endHour - startHour;
      const totalAmount = Math.ceil(hours * rate.PricePerHour);

      // Generate order code
      const orderCode = generateOrderCode();

      // Create payment record (booking will be created after payment success)
      const payment = await Payment.create({
        User: userId,
        Type: 'booking',
        OrderCode: orderCode,
        Amount: totalAmount,
        Description: `Booking payment for ${type} table at ${club.Name} - ${orderCode}`,
        Status: 'PENDING',
      });

      // Store booking data in payment description or create a temporary field
      // We'll store it in a separate collection or in payment metadata
      // For now, we'll store it in Description and parse it later, or better: store in payment
      // Actually, let's create a temporary booking data storage
      // Or we can store booking data in payment and create booking after payment

      // Store booking data temporarily (we'll create booking after payment success)
      // Convert clubId to ObjectId
      const mongoose = require('mongoose');
      payment.BookingData = {
        clubId: mongoose.Types.ObjectId.isValid(clubId) ? new mongoose.Types.ObjectId(clubId) : clubId,
        tableType: type,
        bookingDate,
        startHour,
        endHour,
        note: note || ''
      };
      await payment.save();

      const sepayAccount = process.env.SEPAY_ACC;
      const sepayBank = process.env.SEPAY_BANK;
      const qrUrl = `https://qr.sepay.vn/img?acc=${sepayAccount}&bank=${sepayBank}&amount=${totalAmount}&des=${orderCode}`;

      return res.json({
        message: 'Payment order created successfully',
        orderCode,
        amount: totalAmount,
        qrUrl,
        paymentId: payment._id
      });
    } catch (error) {
      console.error('CreateBookingPaymentOrder error:', error);
      return res.status(500).json({ message: 'Server error when creating payment order' });
    }
  }
};

module.exports = PaymentController;