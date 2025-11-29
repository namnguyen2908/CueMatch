import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';
import paymentApi from '../api/paymentApi';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(''); // '', 'PENDING', 'PAID', 'FAILED'

  const fetchTransactions = async (pageNum = 1, status = null) => {
    try {
      setLoading(true);
      setError('');
      const response = await paymentApi.getUserTransactions(pageNum, 10, status);
      if (response.success) {
        setTransactions(response.data);
        setTotalPages(response.pagination.totalPages);
        setPage(response.pagination.page);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Unable to load transactions. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, statusFilter || null);
  }, [page, statusFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1";
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
        return 'Pending';
      case 'FAILED':
        return 'Failed';
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
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (transactionId) => {
    navigate(`/transactions/${transactionId}`);
  };

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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <Receipt className="w-8 h-8 text-orange-500" />
                  Transaction History
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View and manage all your transactions
                </p>
              </div>
            </div>

            {/* Filter */}
            <div className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Filter by status:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter('')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === ''
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('PAID')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === 'PAID'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setStatusFilter('PENDING')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === 'PENDING'
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter('FAILED')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === 'FAILED'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Loading transactions...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <button
                    onClick={() => fetchTransactions(page, statusFilter || null)}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center">
                  <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                    No transactions yet
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                    {statusFilter ? 'No transactions with this status' : 'Your transactions will appear here'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(transaction._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(transaction.Status)}
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {transaction.Type === 'booking' ? 'Book Table' : (transaction.Plan?.Name || 'Subscription Plan')}
                              </h3>
                              <span className={getStatusBadge(transaction.Status)}>
                                {getStatusText(transaction.Status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {transaction.Description || (transaction.Type === 'booking' ? 'Table booking payment' : `Payment for ${transaction.Plan?.Name || 'subscription plan'}`)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Order Code: <span className="font-mono font-semibold">{transaction.OrderCode}</span></span>
                              <span>•</span>
                              <span>{formatDate(transaction.createdAt)}</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mb-1">
                              {formatCurrency(transaction.Amount)}
                            </p>
                            {transaction.Plan && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {transaction.Plan.Duration} days
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {page} / {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

