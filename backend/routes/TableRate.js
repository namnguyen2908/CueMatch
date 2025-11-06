const express = require('express');
const router = express.Router();
const TableRateController = require('../controllers/TableRateController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.post('/create-price/:clubId', verifyToken, checkRole(['partner']), TableRateController.createTableRate);
router.put('/update-price/:clubId/:type', verifyToken, checkRole(['partner']), TableRateController.updateTableRate);
router.get('/get-price/:clubId/:type', TableRateController.getTableRates);

module.exports = router;