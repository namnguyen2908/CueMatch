const User = require('../models/User');
// import { refreshToken } from './../../frontend/src/api/authApi';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GG_CLIENT_ID);
const axios = require('axios');
const redisClient = require('../redisClient');
const { sendResetPasswordOtpEmail } = require('../sendEmail');
const BilliardsClub = require('../models/BilliardsClub');
const { queueDashboardUpdate } = require('../services/adminDashboardService');

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.Email, role: user.Role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );
};


const AuthController = {
    register: async (req, res) => {
        try {
            const { Email, Password, Name } = req.body;

            // Validate Email: must end with "@gmail.com"
            if (!Email || !Email.endsWith('@gmail.com')) {
                return res.status(400).json({ message: 'Email must end with @gmail.com' });
            }

            // Validate Password: must have at least 1 character, at least 1 letter and 1 number
            if (!Password || Password.length < 1) {
                return res.status(400).json({ message: 'Password must have at least 1 character' });
            }
            const hasLetter = /[a-zA-Z]/.test(Password);
            const hasNumber = /[0-9]/.test(Password);
            if (!hasLetter || !hasNumber) {
                return res.status(400).json({ message: 'Password must contain at least 1 letter and 1 number' });
            }

            // Validate Name: must be text only, no numbers allowed
            if (!Name || Name.trim().length === 0) {
                return res.status(400).json({ message: 'Name cannot be empty' });
            }
            if (/[0-9]/.test(Name)) {
                return res.status(400).json({ message: 'Name must contain only letters, numbers are not allowed' });
            }

            const existingUser = await User.findOne({ Email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists!' });
            }
            const hashedPassword = await bcrypt.hash(Password, 10);
            const newUser = new User({
                Email,
                Password: hashedPassword,
                Name,
            });
            await newUser.save();
            queueDashboardUpdate(req.app);
            return res.status(200).json({ message: 'User registered successfully' });
        } catch (err) {
            return res.status(500).json({ message: 'Server error' });
        }
    },

    login: async (req, res) => {
        try {
            const { Email, Password } = req.body;

            const user = await User.findOne({ Email });
            if (!user) {
                return res.status(401).json({ message: 'Email does not exist' });
            }
            if (user.Provider !== 'local') {
                return res.status(401).json({ message: 'Email is not registered with local account' });
            }
            const isMatch = await bcrypt.compare(Password, user.Password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect password' });
            }
            let clubId = null;
            if (user.Role === 'partner') {
                console.log('🔍 AuthController: Looking for club with Owner:', user._id);
                const club = await BilliardsClub.findOne({ Owner: user._id });
                console.log('🔍 AuthController: Found club:', club ? { id: club._id, name: club.Name } : null);
                clubId = club ? String(club._id) : null;
                console.log('🔍 AuthController: Returning clubId:', clubId);
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Set cookies
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
                sameSite: 'Strict',
                secure: false, // true nếu dùng HTTPS
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'Strict',
                secure: false,
            });

            res.status(200).json({ message: 'Login successful', user: { id: user._id, Name: user.Name, Avatar: user.Avatar, Role: user.Role, clubId, }, accessToken });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    refreshToken: async (req, res) => {
        //take refresh token from user
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
            const user = await User.findById(decoded.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
                sameSite: 'Strict',
                secure: false,
            });
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'Strict',
                secure: false,
            });
            res.status(200).json({ message: 'Token refreshed successfully' });
        })
    },

    googleLogin: async (req, res) => {
        try {
            const { code } = req.body;
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: process.env.GG_CLIENT_ID,
                client_secret: process.env.GG_CLIENT_SECRET,
                redirect_uri: 'postmessage',
                grant_type: 'authorization_code',
            });
            const { access_token } = tokenResponse.data;
            const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const { email } = userInfo.data;
            let name = userInfo.data.name;
            let picture = userInfo.data.picture;
            let user = await User.findOne({ Email: email });
            if (user && user.Provider !== 'google') {
                return res.status(400).json({ message: 'Email already registered by another method' });
            }
            let createdNewUser = false;
            if (!user) {
                user = new User({ Email: email, Name: name, Avatar: picture, Provider: 'google', });
                await user.save();
                createdNewUser = true;
            } else {
                name = user.Name;
                picture = user.Avatar;
            }
            let clubId = null;
            if (user.Role === 'partner') {
                console.log('AuthController (Google): Looking for club with Owner:', user._id);
                const club = await BilliardsClub.findOne({ Owner: user._id });
                console.log('AuthController (Google): Found club:', club ? { id: club._id, name: club.Name } : null);
                clubId = club ? String(club._id) : null;
                console.log('AuthController (Google): Returning clubId:', clubId);
            }
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 1 * 60 * 1000,
                sameSite: 'Strict',
                secure: false,
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'Strict',
                secure: false,
            });
            if (createdNewUser) { queueDashboardUpdate(req.app); }
            return res.status(200).json({ message: 'Login with Google successful',
                user: { id: user._id, Name: name, Avatar: picture, Role: user.Role, clubId, }, accessToken,
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Google login failed' });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { Email } = req.body;
            if (!Email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            const user = await User.findOne({ Email, Provider: 'local' });
            if (!user) {
                return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const key = `otp:${Email}`;

            await redisClient.setEx(key, 60 * 5, otp); // 5 minutes

            await sendResetPasswordOtpEmail({
                toEmail: user.Email,
                toName: user.Name,
                otp,
                expiresInMinutes: 5
            });

            return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
        } catch (error) {
            console.error('Forgot password error:', error);
            return res.status(500).json({ message: 'Unable to process request, please try again later.' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { Email, otp, Password } = req.body;
            if (!Email || !otp || !Password) {
                return res.status(400).json({ message: 'Email, OTP and new password are required.' });
            }

            const cachedOtp = await redisClient.get(`otp:${Email}`);
            if (!cachedOtp) {
                return res.status(400).json({ message: 'OTP expired or invalid.' });
            }

            if (cachedOtp !== otp) {
                return res.status(400).json({ message: 'OTP does not match.' });
            }

            const user = await User.findOne({ Email, Provider: 'local' });
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const hashedPassword = await bcrypt.hash(Password, 10);
            user.Password = hashedPassword;
            await user.save();
            await redisClient.del(`otp:${Email}`);

            return res.status(200).json({ message: 'Password updated successfully.' });
        } catch (error) {
            console.error('Reset password error:', error);
            return res.status(500).json({ message: 'Unable to reset password, please try again.' });
        }
    }

};

module.exports = AuthController;