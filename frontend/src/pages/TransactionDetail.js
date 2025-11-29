import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Receipt,
  Package,
  Calendar,
  Hash
} from 'lucide-react';
import paymentApi from '../api/paymentApi';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';

const TransactionDetail = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await paymentApi.getTransactionById(transactionId);
        if (response.success) {
          setTransaction(response.data);
        } else {
          setError('Transaction not found');
        }
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('Unable to load transaction details. Please try again!');
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-8 h-8 text-amber-500" />;
      case 'FAILED':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2";
    switch (status) {
      case 'PAID':
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
      case 'PENDING':
        return `${baseClasses} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAID':
        return 'Paid';
      case 'PENDING':
        return 'Pending Payment';
      case 'FAILED':
        return 'Payment Failed';
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden
        bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50
        dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
        <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-40"></div>
        <Header />
        <div className="pt-24 md:pt-28 relative z-10 flex flex-col lg:flex-row min-h-screen">
          <div className="hidden lg:block w-[250px] flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading transaction details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="relative min-h-screen overflow-hidden
        bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50
        dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
        <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-40"></div>
        <Header />
        <div className="pt-24 md:pt-28 relative z-10 flex flex-col lg:flex-row min-h-screen">
          <div className="hidden lg:block w-[250px] flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">
                {error || 'Transaction not found'}
              </p>
              <button
                onClick={() => navigate('/transactions')}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden
      bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50
      dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-40"></div>
      <Header />
      <div className="pt-24 md:pt-28 relative z-10 flex flex-col lg:flex-row min-h-screen">
        <div className="hidden lg:block w-[250px] flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 px-4 sm:px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={() => navigate('/transactions')}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <Receipt className="w-8 h-8 text-orange-500" />
                  Transaction Details
                </h1>
              </div>
            </div>

            {/* Transaction Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Status Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(transaction.Status)}
                    <div>
                      <h2 className="text-2xl font-black text-white mb-1">
                        {getStatusText(transaction.Status)}
                      </h2>
                      <p className="text-orange-100 text-sm">
                        {transaction.Description || (transaction.Type === 'booking' ? 'Table booking payment' : 'Payment transaction')}
                      </p>
                    </div>
                  </div>
                  <span className={getStatusBadge(transaction.Status)}>
                    {transaction.Status}
                  </span>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="p-6 space-y-6">
                {/* Amount */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount</p>
                  <p className="text-4xl font-black text-orange-600 dark:text-orange-400">
                    {formatCurrency(transaction.Amount)}
                  </p>
                </div>

                {/* Plan Information */}
                {transaction.Plan && (
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="w-6 h-6 text-orange-500" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Subscription Plan Information
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Plan Name:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {transaction.Plan.Name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Price:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(transaction.Plan.Price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {transaction.Plan.Duration} days
                        </span>
                      </div>
                      {transaction.Plan.Type && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Type:</span>
                          <span className="font-semibold text-gray-900 dark:text-white capitalize">
                            {transaction.Plan.Type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Booking Information */}
                {transaction.Type === 'booking' && transaction.BookingData && (
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-6 h-6 text-orange-500" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Booking Information
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Table Type:</span>
                        <span className="font-semibold text-gray-900 dark:text-white capitalize">
                          {transaction.BookingData.tableType || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Booking Date:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {transaction.BookingData.bookingDate || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Time:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {transaction.BookingData.startHour != null && transaction.BookingData.endHour != null
                            ? `${Math.floor(transaction.BookingData.startHour)}:${String(Math.round((transaction.BookingData.startHour % 1) * 60)).padStart(2, '0')} - ${Math.floor(transaction.BookingData.endHour)}:${String(Math.round((transaction.BookingData.endHour % 1) * 60)).padStart(2, '0')}`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Info */}
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Hash className="w-6 h-6 text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Transaction Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Order Code:</span>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        {transaction.OrderCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={getStatusBadge(transaction.Status)}>
                        {getStatusText(transaction.Status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-6 h-6 text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Timestamps
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Created At:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                    {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(transaction.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => navigate('/transactions')}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    Back to List
                  </button>
                  {transaction.Status === 'PENDING' && (
                    <button
                      onClick={() => navigate(`/payment/${transaction.Plan?._id || transaction.Plan}`)}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-bold hover:shadow-xl transition-all duration-300"
                    >
                      Pay Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;

