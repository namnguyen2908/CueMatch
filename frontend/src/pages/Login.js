import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthWarningModal from '../components/AuthWarningModal/AuthWarningModal';
import { login, googleLogin } from '../api/authApi';
import Warning from '../components/Warning';
import { useGoogleLogin } from '@react-oauth/google';
import { useUser } from '../contexts/UserContext';
import { reconnectSocket } from '../socket';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ Email: '', Password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [warning, setWarning] = useState({ show: false, type: 'error', message: '' });
    const { Datalogin } = useUser();
    // Modal warning logic
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (location.state?.showModal) {
            setShowModal(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setWarning({ show: false });
        try {
            const res = await login(formData);
            const { user, accessToken } = res.data;

            Datalogin({
                id: user.id,
                name: user.Name,
                avatar: user.Avatar,
            }, accessToken);

            reconnectSocket(); // ✅ socket sẽ dùng được token
            navigate('/homefeed');
        } catch (err) {
            setWarning({ show: true, type: 'error', message: err.response?.data?.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code', // <- Đây là bắt buộc nếu dùng useGoogleLogin
        onSuccess: async (response) => {
            try {
                // Gửi 'authorization code' lên server
                const res = await googleLogin(response.code);
                const { user, accessToken } = res.data;

                Datalogin({
                    id: user.id,
                    name: user.Name,
                    avatar: user.Avatar,
                }, accessToken);

                reconnectSocket();
                navigate('/homefeed');
            } catch (err) {
                setWarning({
                    show: true,
                    type: 'error',
                    message: err.response?.data?.message || 'Google login failed',
                });
            }
        },
        onError: () => {
            setWarning({
                show: true,
                type: 'error',
                message: 'Google login failed',
            });
        },
    });



    const balls = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        color: ['bg-yellow-400', 'bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500', 'bg-gray-800'][i],
        delay: i * 0.5,
        size: Math.random() * 20 + 30
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 relative overflow-hidden">
            {/* Animated billiard balls background */}
            <div className="absolute inset-0">
                {balls.map((ball) => (
                    <div
                        key={ball.id}
                        className={`absolute rounded-full ${ball.color} opacity-20 animate-bounce`}
                        style={{
                            width: `${ball.size}px`,
                            height: `${ball.size}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${ball.delay}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Floating balls animation */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-white rounded-full shadow-lg animate-pulse opacity-30"></div>
            <div className="absolute top-32 right-20 w-12 h-12 bg-yellow-300 rounded-full shadow-lg animate-bounce opacity-40" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-32 w-20 h-20 bg-orange-300 rounded-full shadow-lg animate-ping opacity-25"></div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left Panel - Branding */}
                    <div className="text-center lg:text-left space-y-8 order-2 lg:order-1">
                        <div className="space-y-6">
                            {/* Logo with billiard ball effect */}
                            <div className="relative inline-block">
                                <div className="w-24 h-24 mx-auto lg:mx-0 bg-white rounded-full shadow-2xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-inner">
                                        <span className="text-white font-bold text-xl">SC</span>
                                    </div>
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                            </div>

                            <div>
                                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                                    Cue<span className="text-yellow-300">Match</span>
                                </h1>
                                <p className="text-xl text-orange-100 font-medium">
                                    Find Your Team, Live the Game Together
                                </p>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="hidden lg:block space-y-4">
                            <div className="flex space-x-4 justify-center lg:justify-start">
                                <div className="w-8 h-8 bg-white rounded-full shadow-lg animate-pulse"></div>
                                <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                <div className="w-8 h-8 bg-red-500 rounded-full shadow-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Login Form */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                                <p className="text-gray-600">Sign in to your account</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Social Login */}

                                <button
                                    type="button"
                                    onClick={() => handleGoogleLogin()}
                                    className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 rounded-xl py-3 px-4 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group"
                                >
                                    <i className="fa-brands fa-google fa-beat-fade fa-sm" style={{ color: '#eb670f' }}></i>
                                    <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">
                                        Continue with Google
                                    </span>
                                </button>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 h-px bg-gray-300"></div>
                                    <span className="text-gray-500 font-medium">or with email</span>
                                    <div className="flex-1 h-px bg-gray-300"></div>
                                </div>

                                {/* Email Input */}
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={formData.Email}
                                        onChange={e => setFormData({ ...formData, Email: e.target.value })}
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 peer"
                                        placeholder="Enter your email"
                                        required
                                    />
                                    {/* <div className="absolute left-4 top-4 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div> */}
                                </div>

                                {/* Password Input */}
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.Password}
                                        onChange={e => setFormData({ ...formData, Password: e.target.value })}
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    {/* <div className="absolute left-4 top-4 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div> */}
                                    {formData.Password && (
                                        <button
                                            type="button"
                                            onClick={togglePassword}
                                            className="absolute right-4 top-4 text-gray-400 hover:text-orange-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a10.987 10.987 0 00-2.646 2.646M9.878 9.878a3 3 0 10.524 3.364M20.537 9.5a10.026 10.026 0 00-4.293-2.825m.847 4.292a10.982 10.982 0 00-2.537 2.537m2.537-2.537L21 12" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-4 px-4 rounded-xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                {/* Links */}
                                <div className="space-y-4 text-center">
                                    <a href="/forgot-password" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                                        Forgot your password?
                                    </a>
                                    <div className="text-gray-600">
                                        Don't have an account?{' '}
                                        <a href="/register" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">
                                            Sign up now
                                        </a>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Warning
                show={warning.show}
                type={warning.type}
                title="Lỗi đăng nhập"
                message={warning.message}
                onClose={() => setWarning({ ...warning, show: false })}
            />
            <AuthWarningModal show={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
};

export default Login;