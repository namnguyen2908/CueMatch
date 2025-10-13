const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const  { verifyToken, checkRole }  = require('../middlewares/authMiddleware');
const parser = require('../middlewares/uploadImage');

router.get('/detail-user', verifyToken, UserController.getUserDetail);
router.get('/detail-user/:userId', verifyToken, UserController.getUserDetail);
router.put('/edit-user', verifyToken, parser.single('Avatar'), UserController.updateUser);
router.get('/all-users', verifyToken, checkRole(['admin']), UserController.getAllUsers);
router.get('/stats', verifyToken, checkRole(['admin']), UserController.getUserStats);
router.delete('/delete-user/:userId', verifyToken, checkRole(['admin']), UserController.deleteUser);
router.get('/growth', verifyToken, checkRole(['admin']), UserController.getUserGrowth);

module.exports = router;