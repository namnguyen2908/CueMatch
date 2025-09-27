// utils/sendEmail.js
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
                <h2 style="color: #2c3e50;">🎱 Thư mời thi đấu Bi-a</h2>
                <p>Hello <strong>${toName}</strong>,</p>

                <p><strong>${fromName}</strong> has sent you an invitation to a billiards match.</p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>📅 Match day:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${matchDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>⏰ Duration:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${timeStart} - ${timeEnd}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>📍 Location:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${location}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>🎮 Billiards type:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${playType}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;"><strong>💬 Message: </strong> ${message || '<i>(No message)</i>'}</p>
                <p style="margin-top: 40px; font-size: 0.9em; color: #888;">This email was sent automatically from the system. Please do not reply to this email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendInvitationEmail;