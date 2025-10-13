const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const  { verifyToken, checkRole }  = require('../middlewares/authMiddleware');

// Đăng ký
router.post('/register', AuthController.register);
router.post('/google', AuthController.googleLogin);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);

router.post('/logout', (req, res) => {
    const cookieOptions = {
        path: '/',            // thường mặc định là /
        httpOnly: true,       // tuỳ vào lúc set cookie
        secure: false,         // nếu dùng https
        sameSite: 'Strict'      // nếu cookie cross-site
    };

    for (let cookieName in req.cookies) {
        // Clear với options nếu có
        res.clearCookie(cookieName, cookieOptions);
    }

    res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/check', verifyToken, (req, res) => {
    res.status(200).json({
        loggedIn: true,
        user: req.user // { id, email }
    });
});


module.exports = router;