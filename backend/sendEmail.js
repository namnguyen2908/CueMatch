const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

const sendInvitationEmail = async ({ toEmail, toName, fromName, matchDate, timeStart, timeEnd, location, playType, message }) => {
    const mailOptions = {
        from: `"${fromName}" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: 'Invitation to a billiards match',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #2c3e50;">🎱 Billiards Match Invitation</h2>
                <p>Hello <strong>${toName}</strong>,</p>
                <p><strong>${fromName}</strong> has invited you to a billiards match.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>📅 Date:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${matchDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>⏰ Time:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${timeStart} - ${timeEnd}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>📍 Location:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${location}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>🎮 Type:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${playType}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;"><strong>💬 Message: </strong> ${message || '<i>(No message)</i>'}</p>
                <p style="margin-top: 40px; font-size: 0.9em; color: #888;">This is an automated email. Do not reply.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendSubscriptionReminderEmail = async ({ toEmail, toName, planName, expiryDate }) => {
    const mailOptions = {
        from: `"Billiards Subscription" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: 'Your subscription plan is about to expire',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #d35400;">⚠️ Your plan is about to expire</h2>
                <p>Hello <strong>${toName}</strong>,</p>
                <p>Your subscription plan <strong>${planName}</strong> will expire on <strong>${expiryDate}</strong>.</p>
                <p>Please renew your plan to continue enjoying all features.</p>
                <a href="https://your-domain.com/renew-plan" 
                   style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #27ae60; color: #fff; text-decoration: none; border-radius: 5px;">
                    Renew Now
                </a>
                <p style="margin-top: 40px; font-size: 0.9em; color: #888;">This is an automated email. Do not reply.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendResetPasswordOtpEmail = async ({ toEmail, toName, otp, expiresInMinutes = 5 }) => {
    const mailOptions = {
        from: `"CueMatch Support" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: 'Reset your CueMatch password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 24px; background-color: #fdfdfd;">
                <h2 style="color: #ff6b2c;">🔐 Password Reset Request</h2>
                <p>Hello <strong>${toName}</strong>,</p>
                <p>We received a request to reset your CueMatch password. Use the OTP below:</p>
                <div style="font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #ff6b2c; text-align: center; margin: 24px 0;">
                    ${otp}
                </div>
                <p>This code is valid for <strong>${expiresInMinutes} minutes</strong>. Do not share it with anyone.</p>
                <p>If you did not request this change, ignore this email.</p>
                <p style="margin-top: 32px; font-size: 0.9em; color: #888;">This is an automated email. Do not reply.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendInvitationEmail, sendSubscriptionReminderEmail, sendResetPasswordOtpEmail };