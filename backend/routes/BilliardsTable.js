const express = require('express');
const router = express.Router();
const BilliardsTableController = require('../controllers/BilliardsTableController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const checkFeature = require('../middlewares/checkFeature');

router.post('/create-table', verifyToken, checkRole(['partner']), BilliardsTableController.createTable);
router.get('/get-table/:clubId', verifyToken, BilliardsTableController.getTableByClub);
router.put('/edit-table/:id', verifyToken, checkRole(['partner']), BilliardsTableController.updateTable);
router.delete('/delete-table/:id', verifyToken, checkRole(['partner']), BilliardsTableController.deleteTable);
router.get('/detail-table/:id', verifyToken, checkRole(['partner']), BilliardsTableController.getDetailTable);

module.exports = router;