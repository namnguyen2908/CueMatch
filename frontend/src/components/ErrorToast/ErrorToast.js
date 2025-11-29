import { useEffect, useState, useCallback } from 'react';

const ErrorToast = ({ error, onClose, duration = 5000 }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (error) {
      console.log('ErrorToast: Error received', error);
      setIsExiting(false);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error, duration, handleClose]);

  if (!error) {
    return null;
  }

  const errorKey = error
    ? typeof error === 'string'
      ? error
      : JSON.stringify(error)
    : null;

  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.data) {
      return typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data);
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unknown error occurred';
  };

  const errorMessage = getErrorMessage();

  console.log('ErrorToast: Rendering', { error, isExiting, errorMessage });

  return (
    <div
      key={errorKey}
      className={`fixed bottom-4 right-4 max-w-md w-full transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      style={{
        pointerEvents: 'auto',
        zIndex: 99999,
        position: 'fixed',
      }}
    >
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg shadow-2xl p-4 backdrop-blur-sm">
        <div className="flex items-start">

          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">
              Error
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400">
              {errorMessage}
            </p>
          </div>

          {/* Close Button */}
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:outline-none transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-red-200 dark:bg-red-800/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 dark:bg-red-400 rounded-full animate-shrink"
            style={{
              animationDuration: `${duration}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;