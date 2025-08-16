import React, { useEffect, useState } from 'react';

const Warning = ({
    show,
    type = 'error',
    title = 'Thông báo',
    message = '',
    onClose,
    onConfirm,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    showConfirm = false,
    autoClose = false,
    duration = 3000,
}) => {
    const [visible, setVisible] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (show) {
            setVisible(true);
            setTimeout(() => setAnimate(true), 10);
            if (autoClose && !showConfirm) {
                setTimeout(() => handleClose(), duration);
            }
        } else {
            setAnimate(false);
            setTimeout(() => setVisible(false), 300);
        }
    }, [show, autoClose, duration, showConfirm]);

    const handleClose = () => {
        setAnimate(false);
        setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, 300);
    };

    const handleConfirm = () => {
        onConfirm?.();
        handleClose();
    };

    if (!visible) return null;

    const variants = {
        error: {
            color: 'text-red-600',
            ring: 'ring-red-500/20',
            iconBg: 'bg-red-100',
            button: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.93 19h12.14c1.54 0 2.5-1.66 1.73-2.5L13.73 4c-.77-.83-1.73-.83-2.5 0L3.34 16.5c-.77.84.19 2.5 1.73 2.5z" />
                </svg>
            )
        },
        success: {
            color: 'text-green-600',
            ring: 'ring-green-500/20',
            iconBg: 'bg-green-100',
            button: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        warning: {
            color: 'text-amber-600',
            ring: 'ring-amber-500/20',
            iconBg: 'bg-amber-100',
            button: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.93 19h12.14c1.54 0 2.5-1.66 1.73-2.5L13.73 4c-.77-.83-1.73-.83-2.5 0L3.34 16.5c-.77.84.19 2.5 1.73 2.5z" />
                </svg>
            )
        },
        info: {
            color: 'text-blue-600',
            ring: 'ring-blue-500/20',
            iconBg: 'bg-blue-100',
            button: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    const variant = variants[type] || variants.error;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
                animate ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
            }`}
            onClick={handleClose}
        >
            <div
                className={`relative w-full max-w-md transform transition-all duration-300 ${
                    animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0 translate-y-8'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`bg-white rounded-2xl shadow-2xl ring-1 ${variant.ring} overflow-hidden`}>
                    {/* Close button */}
                    <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content */}
                    <div className="p-8">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`${variant.iconBg} ${variant.color} p-4 rounded-full shadow-lg`}>
                                {variant.icon}
                            </div>
                        </div>

                        {/* Title + Message */}
                        <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">{title}</h3>
                        <p className="text-center text-gray-600 mb-6">{message}</p>

                        {/* Buttons */}
                        <div className="flex justify-center gap-3">
                            {showConfirm ? (
                                <>
                                    <button
                                        className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        onClick={handleClose}
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        className={`px-5 py-2 rounded-xl text-white ${variant.button}`}
                                        onClick={handleConfirm}
                                    >
                                        {confirmText}
                                    </button>
                                </>
                            ) : (
                                <button
                                    className={`px-6 py-2 rounded-xl text-white ${variant.button}`}
                                    onClick={handleClose}
                                >
                                    Đóng
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Warning;
