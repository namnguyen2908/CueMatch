const User = require('../models/User');
// import { refreshToken } from './../../frontend/src/api/authApi';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client, auth } = require('google-auth-library');
const client = new OAuth2Client(process.env.GG_CLIENT_ID);
const axios = require('axios');
// const { refreshToken } = require('../../frontend/src/api/authApi');

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.Email },
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
            return res.status(200).json({ message: 'User registered successfully' });
        } catch (err) {
            return res.status(500).json({ message: 'Server error' });
        }
    },

    login: async (req, res) => {
        try {
            const { Email, Password } = req.body;

            const user = await User.findOne({ Email });
            if (!user || user.Provider !== 'local') {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(Password, user.Password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Set cookies
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 5 * 60 * 1000,
                sameSite: 'Strict',
                secure: false, // true nếu dùng HTTPS
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'Strict',
                secure: false,
            });

            res.status(200).json({ message: 'Login successful', user: { id: user._id, Name: user.Name, Avatar: user.Avatar, } });

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
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if(err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
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
                redirect_uri: 'postmessage', // Nếu frontend không redirect
                grant_type: 'authorization_code',
            });
            const { access_token } = tokenResponse.data;

            const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            const { email, name, picture } = userInfo.data;

            let user = await User.findOne({ Email: email });
            if (user && user.Provider !== 'google') {
                return res.status(400).json({ message: 'Email đã được đăng ký bằng phương thức khác' });
            }

            if (!user) {
                user = new User({
                    Email: email,
                    Name: name,
                    Avatar: picture,
                    Provider: 'google',
                });
                await user.save();
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 5 * 60 * 1000,
                sameSite: 'Strict',
                secure: false,
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'Strict',
                secure: false,
            });

            return res.status(200).json({
                message: 'Login with Google successful',
                user: { id: user._id, Name: user.Name, Avatar: user.Avatar },
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Google login failed' });
        }
    }


};

module.exports = AuthController;