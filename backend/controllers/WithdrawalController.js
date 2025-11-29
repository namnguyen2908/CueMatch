const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const mongoose = require('mongoose');

const WithdrawalController = {
  // Create withdrawal request
  createWithdrawal: async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount, accountNumber, bankName, recipientName } = req.body;

      // Validate required fields
      if (!amount || !accountNumber || !bankName || !recipientName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Validate amount
      const withdrawalAmount = Number(amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }

      if (withdrawalAmount < 20000) {
        return res.status(400).json({ message: 'Minimum withdrawal amount is 20,000 VND' });
      }

      if (withdrawalAmount > 500000) {
        return res.status(400).json({ message: 'Maximum withdrawal amount is 500,000 VND' });
      }

      // Get user wallet
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Initialize wallet if not exists
      if (!user.Wallet) {
        user.Wallet = {
          Balance: 0,
          TotalEarned: 0,
          TotalWithdrawn: 0
        };
        await user.save();
      }

      // Check if user has enough balance
      const currentBalance = user.Wallet.Balance || 0;
      if (withdrawalAmount > currentBalance) {
        return res.status(400).json({ 
          message: 'Insufficient balance. Available balance: ' + currentBalance.toLocaleString() + ' VND' 
        });
      }

      // Create withdrawal request
      const withdrawal = await Withdrawal.create({
        User: userId,
        Amount: withdrawalAmount,
        AccountNumber: accountNumber.trim(),
        BankName: bankName.trim(),
        RecipientName: recipientName.trim(),
        Status: 'pending'
      });

      return res.status(201).json({
        success: true,
        message: 'Withdrawal request created successfully',
        withdrawal
      });
    } catch (error) {
      console.error('Create withdrawal error:', error);
      return res.status(500).json({ message: 'Error creating withdrawal request' });
    }
  },

  // Get user's withdrawal history
  getMyWithdrawals: async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status; // optional filter
      const skip = (page - 1) * limit;

      const query = { User: userId };
      if (status && ['pending', 'processing', 'completed', 'rejected'].includes(status)) {
        query.Status = status;
      }

      const withdrawals = await Withdrawal.find(query)
        .populate('ProcessedBy', 'Name Email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Withdrawal.countDocuments(query);

      return res.json({
        success: true,
        data: withdrawals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get withdrawals error:', error);
      return res.status(500).json({ message: 'Error fetching withdrawals' });
    }
  },

  // Get withdrawal by ID (for user to view details)
  getWithdrawalById: async (req, res) => {
    try {
      const userId = req.user.id;
      const { withdrawalId } = req.params;

      const withdrawal = await Withdrawal.findById(withdrawalId)
        .populate('ProcessedBy', 'Name Email')
        .select('-__v');

      if (!withdrawal) {
        return res.status(404).json({ message: 'Withdrawal not found' });
      }

      // Check if withdrawal belongs to user
      if (withdrawal.User.toString() !== userId) {
        return res.status(403).json({ message: 'You do not have permission to view this withdrawal' });
      }

      return res.json({
        success: true,
        data: withdrawal
      });
    } catch (error) {
      console.error('Get withdrawal by ID error:', error);
      return res.status(500).json({ message: 'Error fetching withdrawal details' });
    }
  },

  // Admin: Get all withdrawal requests (with filters)
  getAllWithdrawals: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status; // optional filter
      const skip = (page - 1) * limit;

      const query = {};
      if (status && ['pending', 'processing', 'completed', 'rejected'].includes(status)) {
        query.Status = status;
      }

      const withdrawals = await Withdrawal.find(query)
        .populate('User', 'Name Email')
        .populate('ProcessedBy', 'Name Email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Withdrawal.countDocuments(query);

      return res.json({
        success: true,
        data: withdrawals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all withdrawals error:', error);
      return res.status(500).json({ message: 'Error fetching withdrawals' });
    }
  },

  // Admin: Approve withdrawal request
  approveWithdrawal: async (req, res) => {
    try {
      const adminId = req.user.id;
      const { withdrawalId } = req.params;

      const withdrawal = await Withdrawal.findById(withdrawalId).populate('User');
      if (!withdrawal) {
        return res.status(404).json({ message: 'Withdrawal not found' });
      }

      if (withdrawal.Status !== 'pending') {
        return res.status(400).json({ message: 'Withdrawal is not in pending status' });
      }

      const user = await User.findById(withdrawal.User._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Initialize wallet if not exists
      if (!user.Wallet) {
        user.Wallet = {
          Balance: 0,
          TotalEarned: 0,
          TotalWithdrawn: 0
        };
      }

      // Check if user still has enough balance
      const currentBalance = user.Wallet.Balance || 0;
      if (withdrawal.Amount > currentBalance) {
        return res.status(400).json({ 
          message: 'User has insufficient balance. Current balance: ' + currentBalance.toLocaleString() + ' VND' 
        });
      }

      // Use transaction to ensure atomicity
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Deduct from wallet
        user.Wallet.Balance = currentBalance - withdrawal.Amount;
        user.Wallet.TotalWithdrawn = (user.Wallet.TotalWithdrawn || 0) + withdrawal.Amount;
        await user.save({ session });

        // Update withdrawal status
        withdrawal.Status = 'completed';
        withdrawal.ProcessedAt = new Date();
        withdrawal.ProcessedBy = adminId;
        await withdrawal.save({ session });

        await session.commitTransaction();
        session.endSession();

        console.log(`✅ Withdrawal ${withdrawalId} approved by admin ${adminId}. Amount: ${withdrawal.Amount} VND`);

        return res.json({
          success: true,
          message: 'Withdrawal approved successfully',
          withdrawal
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      console.error('Approve withdrawal error:', error);
      return res.status(500).json({ message: 'Error approving withdrawal' });
    }
  },

  // Admin: Reject withdrawal request
  rejectWithdrawal: async (req, res) => {
    try {
      const adminId = req.user.id;
      const { withdrawalId } = req.params;
      const { reason } = req.body;

      const withdrawal = await Withdrawal.findById(withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({ message: 'Withdrawal not found' });
      }

      if (withdrawal.Status !== 'pending') {
        return res.status(400).json({ message: 'Withdrawal is not in pending status' });
      }

      // Update withdrawal status
      withdrawal.Status = 'rejected';
      withdrawal.ProcessedAt = new Date();
      withdrawal.ProcessedBy = adminId;
      if (reason) {
        withdrawal.RejectionReason = reason.trim();
      }

      await withdrawal.save();

      console.log(`❌ Withdrawal ${withdrawalId} rejected by admin ${adminId}. Reason: ${reason || 'No reason provided'}`);

      return res.json({
        success: true,
        message: 'Withdrawal rejected successfully',
        withdrawal
      });
    } catch (error) {
      console.error('Reject withdrawal error:', error);
      return res.status(500).json({ message: 'Error rejecting withdrawal' });
    }
  }
};

module.exports = WithdrawalController;

