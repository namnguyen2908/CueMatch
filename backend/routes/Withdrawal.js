const express = require('express');
const router = express.Router();
const WithdrawalController = require('../controllers/WithdrawalController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// User routes
router.post('/create', verifyToken, WithdrawalController.createWithdrawal);
router.get('/my-withdrawals', verifyToken, WithdrawalController.getMyWithdrawals);
router.get('/:withdrawalId', verifyToken, WithdrawalController.getWithdrawalById);

// Admin routes
router.get('/admin/all', verifyToken, checkRole(['admin', 'administrator']), WithdrawalController.getAllWithdrawals);
router.put('/admin/approve/:withdrawalId', verifyToken, checkRole(['admin', 'administrator']), WithdrawalController.approveWithdrawal);
router.put('/admin/reject/:withdrawalId', verifyToken, checkRole(['admin', 'administrator']), WithdrawalController.rejectWithdrawal);

module.exports = router;

