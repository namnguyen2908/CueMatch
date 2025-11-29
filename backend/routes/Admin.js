const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.get(
  '/dashboard',
  verifyToken,
  checkRole(['admin']),
  AdminController.getDashboardOverview
);

module.exports = router;

