const express = require('express');
const router = express.Router();
const BilliardsBookingController = require('../controllers/BilliardsBookingController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.post('/book-table', verifyToken, BilliardsBookingController.bookTable);
router.get('/get-bookings', verifyToken, checkRole(['user', 'partner']), BilliardsBookingController.getUserBookings);
router.put('/check-in/:id', verifyToken, checkRole(['partner']), BilliardsBookingController.checkIn);
router.put('/check-out/:id', verifyToken, checkRole(['partner']), BilliardsBookingController.checkOut);
router.put('/cancel-booking/:id', verifyToken, checkRole(['user']), BilliardsBookingController.cancelBooking);
router.post('/open-table', verifyToken, checkRole(['partner']), BilliardsBookingController.openNow);
router.put('/end-play/:bookingId', verifyToken, checkRole(['partner']), BilliardsBookingController.endPlay);
router.get('/preview-bookings/:bookingId', verifyToken, checkRole(['partner']), BilliardsBookingController.previewEndPlay);
router.get('/check-available-tables/:clubId', verifyToken, BilliardsBookingController.checkAvailable);
router.get('/dashboard-stats', verifyToken, checkRole(['partner']), BilliardsBookingController.getDashboardStats);
router.get('/revenue-by-time', verifyToken, checkRole(['partner']), BilliardsBookingController.getRevenueByTime);

module.exports = router;