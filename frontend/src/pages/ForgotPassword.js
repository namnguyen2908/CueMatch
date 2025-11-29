import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordOtp, resetPassword } from '../api/authApi';

const OTP_LENGTH = 6;

const ForgotPassword = () => {
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [banner, setBanner] = useState({ type: '', message: '' });

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setBanner({ type: '', message: '' });
        setIsSuccess(false);

        try {
            await requestPasswordOtp(email);
            setStep('otp');
            setBanner({
                type: 'info',
                message: 'We sent a 6-digit OTP to your email. Please check your inbox (including spam).'
            });
        } catch (error) {
            setBanner({
                type: 'error',
                message: error.response?.data?.message || 'Unable to send OTP. Please try again.'
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleOtpInput = (value) => {
        if (!/^\d*$/.test(value)) return;
        if (value.length <= OTP_LENGTH) {
            setOtp(value);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (otp.length !== OTP_LENGTH) {
            setBanner({ type: 'error', message: 'Please enter the full OTP.' });
            return;
        }
        if (password.length < 8) {
            setBanner({ type: 'error', message: 'Password must be at least 8 characters.' });
            return;
        }
        if (password !== confirmPassword) {
            setBanner({ type: 'error', message: 'Passwords do not match.' });
            return;
        }

        setIsResetting(true);
        setBanner({ type: '', message: '' });
        try {
            await resetPassword({ Email: email, otp, Password: password });
            setIsSuccess(true);
            setBanner({ type: 'success', message: 'Password updated successfully. You can log in now.' });
        } catch (error) {
            setBanner({
                type: 'error',
                message: error.response?.data?.message || 'Unable to reset password. Please try again.'
            });
        } finally {
            setIsResetting(false);
        }
    };

    const progressWidth = step === 'email' ? '50%' : '100%';

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-30">
                {[...Array(10)].map((_, idx) => (
                    <div
                        key={idx}
                        className="absolute rounded-full bg-white mix-blend-overlay animate-pulse"
                        style={{
                            width: `${Math.random() * 40 + 20}px`,
                            height: `${Math.random() * 40 + 20}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                            animationDelay: `${Math.random()}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-5xl">
                <div className="bg-white/95 backdrop-blur-lg rounded-[32px] shadow-2xl border border-white/30 overflow-hidden">
                    <div className="flex flex-col lg:flex-row min-h-[420px]">
                        <div className="lg:w-1/2 p-8 bg-gradient-to-br from-orange-500 to-red-500 text-white space-y-5">
                            <div>
                                <span className="inline-flex items-center px-3 py-1 text-[11px] font-semibold uppercase tracking-widest rounded-full bg-white/20">
                                    Secure Your Account
                                </span>
                                <h1 className="mt-5 text-3xl font-bold leading-snug">
                                    Reset your password in just a few simple steps
                                </h1>
                                <p className="mt-3 text-white/85 text-sm leading-relaxed">
                                    Enter the registered email, receive the secure OTP, and verify to unlock the final password reset step.
                                </p>
                            </div>
                            <ul className="space-y-3 text-white/90 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 w-2 h-2 rounded-full bg-white"></span>
                                    Instant OTP delivery, valid for 5 minutes.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 w-2 h-2 rounded-full bg-white"></span>
                                    Extra protection with two-layer verification.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 w-2 h-2 rounded-full bg-white"></span>
                                    24/7 support if you run into verification issues.
                                </li>
                            </ul>
                        </div>

                        <div className="lg:w-1/2 p-10">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Forgot password</h2>
                                <p className="text-gray-500">Enter your email and verify the OTP to continue.</p>
                            </div>

                            <div className="mb-6">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" style={{ width: progressWidth }} />
                                </div>
                                <div className="flex justify-between text-xs font-semibold text-gray-500 mt-2">
                                    <span className={step === 'email' ? 'text-orange-500' : ''}>Step 1: Email</span>
                                    <span className={step === 'otp' ? 'text-orange-500' : ''}>Step 2: OTP & Reset</span>
                                </div>
                            </div>

                            {step === 'email' && (
                                <form className="space-y-5" onSubmit={handleSendEmail}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Registered email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                                    >
                                        {isSending ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </form>
                            )}

                            {step === 'otp' && (
                                <>
                                    {!isSuccess && (
                                        <form className="space-y-5" onSubmit={handleResetPassword}>
                                            <div className="text-sm text-gray-600">
                                                OTP sent to <span className="font-semibold text-gray-800">{email}</span>. Please enter it within 5 minutes.
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">One-time password</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={otp}
                                                    onChange={(e) => handleOtpInput(e.target.value)}
                                                    maxLength={OTP_LENGTH}
                                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 text-center text-lg font-semibold"
                                                    placeholder="Enter 6-digit code"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
                                                    placeholder="Minimum 8 characters"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
                                                    placeholder="Re-enter password"
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isResetting}
                                                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                                            >
                                                {isResetting ? 'Updating...' : 'Confirm & Reset'}
                                            </button>

                                            <button
                                                type="button"
                                                className="w-full py-3 rounded-2xl border border-dashed border-gray-300 text-gray-600 font-medium hover:border-orange-400 hover:text-orange-500 transition"
                                                onClick={() => {
                                                    setOtp('');
                                                    setPassword('');
                                                    setConfirmPassword('');
                                                    setStep('email');
                                                    setBanner({ type: '', message: '' });
                                                }}
                                            >
                                                Use a different email
                                            </button>
                                        </form>
                                    )}

                                    {isSuccess && (
                                        <div className="space-y-4 text-center">
                                            <div className="text-green-600 font-semibold text-lg">Password reset successful 🎉</div>
                                            <p className="text-gray-600">You can now sign in with your new password.</p>
                                            <Link
                                                to="/"
                                                className="inline-flex justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                            >
                                                Back to login
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}

                            {banner.message && (
                                <div
                                    className={`mt-5 text-sm rounded-2xl p-4 border ${
                                        banner.type === 'error'
                                            ? 'bg-red-50 border-red-100 text-red-700'
                                            : banner.type === 'success'
                                            ? 'bg-green-50 border-green-100 text-green-700'
                                            : 'bg-orange-50 border-orange-100 text-orange-700'
                                    }`}
                                >
                                    {banner.message}
                                </div>
                            )}

                            <div className="mt-6 text-center text-gray-500 text-sm">
                                <p>
                                    Remember your password?{' '}
                                    <Link to="/" className="text-orange-600 font-semibold hover:underline">
                                        Back to login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

