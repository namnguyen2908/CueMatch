const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.post('/create-order', verifyToken, PaymentController.createPaymentOrder);
router.post('/sepay-webhook', PaymentController.SepayWebhook);
router.get('/status/:orderCode', PaymentController.getOrderStatus);

module.exports = router;