import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo_bia.png';
import AuthWarningModal from '../components/AuthWarningModal/AuthWarningModal';
import { register } from '../api/authApi';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ Name: '', Email: '', Password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };
    useEffect(() => {
        if (location.state?.showModal) {
            setShowModal(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);



    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await register(formData);
            alert('Registration successful! Please log in.');
            navigate('/');
        } catch (err) {
            alert('Registration failed. Please try again.');
        }
    };

    // Different ball arrangement for register page
    const balls = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        color: ['bg-white', 'bg-yellow-400', 'bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-800'][i],
        delay: i * 0.3,
        size: Math.random() * 25 + 25
    }));

    return (
        <div className="min-h-screen bg-gradient-to-tl from-orange-500 via-red-500 to-pink-600 relative overflow-hidden">
            {/* Animated billiard balls background - different pattern for register */}
            <div className="absolute inset-0">
                {balls.map((ball) => (
                    <div
                        key={ball.id}
                        className={`absolute rounded-full ${ball.color} opacity-25 shadow-lg`}
                        style={{
                            width: `${ball.size}px`,
                            height: `${ball.size}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationName: 'float',
                            animationDuration: `${4 + Math.random() * 3}s`,
                            animationTimingFunction: 'ease-in-out',
                            animationIterationCount: 'infinite',
                            animationDelay: `${ball.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Cue stick effect - diagonal lines */}
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 opacity-20 transform rotate-12 origin-top"></div>
            <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-yellow-300 via-orange-400 to-red-500 opacity-20 transform -rotate-12 origin-bottom"></div>

            {/* Floating elements with different animations */}
            <div className="absolute top-20 right-10 w-12 h-12 bg-white rounded-full shadow-xl animate-spin opacity-30" style={{ animationDuration: '8s' }}></div>
            <div className="absolute top-1/3 left-16 w-16 h-16 bg-yellow-400 rounded-full shadow-xl animate-pulse opacity-40"></div>
            <div className="absolute bottom-1/4 right-1/4 w-10 h-10 bg-orange-400 rounded-full shadow-xl animate-bounce opacity-35" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left Panel - Branding */}
                    <div className="text-center lg:text-left space-y-8 order-2 lg:order-1">
                        <div className="space-y-6">
                            {/* Logo with enhanced billiard ball effect */}
                            <div className="relative inline-block">
                                <div className="w-28 h-28 mx-auto lg:mx-0 bg-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-500 relative overflow-hidden">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-inner">
                                        <span className="text-white font-bold text-2xl">SC</span>
                                    </div>
                                    {/* Shine effect */}
                                    <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full opacity-30 blur-sm"></div>
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full animate-bounce shadow-lg"></div>
                                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-ping"></div>
                            </div>

                            <div>
                                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                                    Join <span className="text-yellow-300 animate-pulse">Soccer</span>
                                    <br />
                                    <span className="text-pink-200">Circle</span>
                                </h1>
                                <p className="text-xl text-orange-100 font-medium">
                                    Create Your Account & Start Playing
                                </p>
                            </div>
                        </div>

                        {/* Enhanced decorative elements */}
                        <div className="hidden lg:block space-y-6">
                            <div className="flex space-x-3 justify-center lg:justify-start">
                                <div className="w-10 h-10 bg-white rounded-full shadow-lg animate-pulse flex items-center justify-center">
                                    <span className="text-orange-500 font-bold text-sm">1</span>
                                </div>
                                <div className="w-10 h-10 bg-yellow-400 rounded-full shadow-lg animate-pulse flex items-center justify-center" style={{ animationDelay: '0.5s' }}>
                                    <span className="text-gray-800 font-bold text-sm">2</span>
                                </div>
                                <div className="w-10 h-10 bg-red-500 rounded-full shadow-lg animate-pulse flex items-center justify-center" style={{ animationDelay: '1s' }}>
                                    <span className="text-white font-bold text-sm">3</span>
                                </div>
                                <div className="w-10 h-10 bg-purple-500 rounded-full shadow-lg animate-pulse flex items-center justify-center" style={{ animationDelay: '1.5s' }}>
                                    <span className="text-white font-bold text-sm">4</span>
                                </div>
                            </div>

                            <div className="text-orange-100/80 space-y-2">
                                <p className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                                    <span>Find teammates instantly</span>
                                </p>
                                <p className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></span>
                                    <span>Join local tournaments</span>
                                </p>
                                <p className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></span>
                                    <span>Track your progress</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Register Form */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                                <p className="text-gray-600">Join the community today</p>
                            </div>

                            <div className="space-y-6">
                                {/* Social Register */}
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 rounded-xl py-3 px-4 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group hover:scale-[1.02]"
                                >
                                    <i className="fa-brands fa-google" style={{ color: '#eb670f' }}></i>
                                    <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">Sign up with Google</span>
                                </button>

                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                    <span className="text-gray-500 font-medium px-2">or with email</span>
                                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-transparent"></div>
                                </div>
                                {/* Name Input */}
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={formData.Name}
                                        onChange={e => setFormData({ ...formData, Name: e.target.value })}
                                        className="w-full px-4 py-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                    <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={formData.Email}
                                        onChange={e => setFormData({ ...formData, Email: e.target.value })}
                                        className="w-full px-4 py-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100"
                                        placeholder="Enter your email"
                                        required
                                    />
                                    <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.Password}
                                        onChange={e => setFormData({ ...formData, Password: e.target.value })}
                                        className="w-full px-4 py-4 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100"
                                        placeholder="Create a strong password"
                                        required
                                    />
                                    <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    {formData.Password && (
                                        <button
                                            type="button"
                                            onClick={togglePassword}
                                            className="absolute right-4 top-4 text-gray-400 hover:text-orange-600 transition-colors focus:outline-none"
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

                                {/* Password strength indicator */}
                                {formData.Password && (
                                    <div className="space-y-2">
                                        <div className="flex space-x-1">
                                            <div className={`h-1 w-1/4 rounded-full ${formData.Password.length >= 6 ? 'bg-red-400' : 'bg-gray-200'} transition-colors`}></div>
                                            <div className={`h-1 w-1/4 rounded-full ${formData.Password.length >= 8 ? 'bg-yellow-400' : 'bg-gray-200'} transition-colors`}></div>
                                            <div className={`h-1 w-1/4 rounded-full ${formData.Password.length >= 10 && /[A-Z]/.test(formData.Password) ? 'bg-green-400' : 'bg-gray-200'} transition-colors`}></div>
                                            <div className={`h-1 w-1/4 rounded-full ${formData.Password.length >= 12 && /[A-Z]/.test(formData.Password) && /[0-9]/.test(formData.Password) ? 'bg-green-600' : 'bg-gray-200'} transition-colors`}></div>
                                        </div>
                                        <p className="text-xs text-gray-500">Use 8+ characters with letters, numbers & symbols</p>
                                    </div>
                                )}

                                {/* Register Button */}
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={handleRegister}
                                    className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white font-semibold py-4 px-4 rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating account...</span>
                                        </div>
                                    ) : (
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>Create Account</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    )}
                                </button>

                                {/* Terms */}
                                <p className="text-xs text-gray-500 text-center leading-relaxed">
                                    By creating an account, you agree to our{' '}
                                    <a href="/terms" className="text-orange-600 hover:text-orange-700 font-medium">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">Privacy Policy</a>
                                </p>

                                {/* Login Link */}
                                <div className="text-center pt-4 border-t border-gray-200">
                                    <p className="text-gray-600">
                                        Already have an account?{' '}
                                        <a href="/" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors hover:underline">
                                            Sign in here
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                33% { transform: translateY(-10px) rotate(120deg); }
                66% { transform: translateY(10px) rotate(240deg); }
                }
            `}</style>
            <AuthWarningModal show={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
};

export default Register;