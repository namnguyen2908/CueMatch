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
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

router.post('/logout', (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttpsFrontend = process.env.FRONTEND_URL && process.env.FRONTEND_URL.startsWith('https://');
    const useSecureCookies = isProduction || isHttpsFrontend;

    const cookieOptions = {
        path: '/',
        httpOnly: true,
        secure: useSecureCookies,
        sameSite: useSecureCookies ? 'None' : 'Strict',
    };

    // Chỉ cần xoá cookie auth chính; tránh clear tất cả cookie khác không cần thiết
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/check', verifyToken, async (req, res) => {
    try {
        // Lấy Role từ database để đảm bảo chính xác
        const user = await User.findById(req.user.id).select('Role');
        res.status(200).json({
            loggedIn: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                role: user?.Role || req.user.role // Lấy từ DB hoặc từ token
            }
        });
    } catch (err) {
        // Fallback: lấy role từ token nếu không query được DB
        res.status(200).json({
            loggedIn: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role // Từ token
            }
        });
    }
});


module.exports = router;