const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.post('/create-order', verifyToken, PaymentController.createPaymentOrder);
router.post('/create-booking-payment', verifyToken, PaymentController.createBookingPaymentOrder);
router.post('/sepay-webhook', PaymentController.SepayWebhook);
router.get('/status/:orderCode', PaymentController.getOrderStatus);
router.post('/renew-subplan', verifyToken, PaymentController.renewSubscription);
router.get('/status-sub', verifyToken, PaymentController.getSubscriptionStatus);
router.get('/transactions', verifyToken, PaymentController.getUserTransactions);
router.get('/transactions/:transactionId', verifyToken, PaymentController.getTransactionById);

module.exports = router;