const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/SearchController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, SearchController.globalSearch);

module.exports = router;

