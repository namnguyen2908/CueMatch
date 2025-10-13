const express = require('express');
const router = express.Router();
const BilliardsClubController = require('../controllers/BilliardsClubController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const checkFeature = require('../middlewares/checkFeature');

router.get('/clubs', verifyToken, BilliardsClubController.getAllClubs);
router.get('/detail-club/:id', verifyToken, BilliardsClubController.getClubById);
router.post('/create-club', verifyToken, checkRole(['partner']), checkFeature('Club'), BilliardsClubController.createClub);
router.get('/my-club', verifyToken, checkRole(['partner']), checkFeature('Club'), BilliardsClubController.getMyClubs);
router.put('/update-club/:id', verifyToken, checkRole(['partner']), checkFeature('Club'), BilliardsClubController.updateClub);
router.delete('/delete-club/:id', verifyToken, BilliardsClubController.deleteClub);

module.exports = router;