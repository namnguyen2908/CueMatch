const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = user; // id, email, role
        next();
    });
};

const checkRole = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'User ID missing from request' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (!allowedRoles.includes(user.Role)) {
                return res.status(403).json({ message: 'Access denied: insufficient permissions' });
            }

            // Optionally attach user role to req for future use
            req.user.role = user.Role;

            next();
        } catch (error) {
            console.error('Error in checkRole middleware:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};

module.exports = { verifyToken, checkRole };