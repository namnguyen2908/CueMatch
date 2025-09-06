const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const  verifyToken  = require('../middlewares/authMiddleware');
const parser = require('../middlewares/uploadImage');

router.get('/detail-user', verifyToken, UserController.getUserDetail);
router.get('/detail-user/:userId', verifyToken, UserController.getUserDetail);
router.put('/edit-user', verifyToken, parser.single('avatar'), UserController.updateUser);
router.delete('/delete-user', verifyToken, UserController.deleteUser);

module.exports = router;