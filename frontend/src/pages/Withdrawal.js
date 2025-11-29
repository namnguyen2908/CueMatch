import React, { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { Wallet as WalletIcon, ArrowDown, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import userApi from '../api/userApi';
import withdrawalApi from '../api/withdrawalApi';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
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

const getStatusBadge = (status) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1";
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
    case 'processing':
      return `${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
    case 'pending':
      return `${baseClasses} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
    case 'rejected':
      return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'processing':
      return 'Processing';
    case 'pending':
      return 'Pending';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

const Withdrawal = () => {
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWalletBalance();
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [page]);

  const fetchWalletBalance = async () => {
    try {
      setLoading(true);
      const data = await userApi.getWalletBalance();
      setWalletBalance(data);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoadingWithdrawals(true);
      const response = await withdrawalApi.getMyWithdrawals(page, 10);
      if (response.success) {
        setWithdrawals(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    const withdrawalAmount = Number(amount);
    if (!amount || isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount < 20000) {
      setError('Minimum withdrawal amount is 20,000 VND');
      return;
    }

    if (withdrawalAmount > 500000) {
      setError('Maximum withdrawal amount is 500,000 VND');
      return;
    }

    if (!walletBalance || withdrawalAmount > walletBalance.balance) {
      setError('Insufficient balance');
      return;
    }

    if (!accountNumber.trim()) {
      setError('Account number is required');
      return;
    }

    if (!bankName.trim()) {
      setError('Bank name is required');
      return;
    }

    if (!recipientName.trim()) {
      setError('Recipient name is required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await withdrawalApi.createWithdrawal({
        amount: withdrawalAmount,
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim(),
        recipientName: recipientName.trim()
      });

      if (response.success) {
        setSuccess('Withdrawal request created successfully!');
        // Reset form
        setAmount('');
        setAccountNumber('');
        setBankName('');
        setRecipientName('');
        // Refresh data
        fetchWalletBalance();
        fetchWithdrawals();
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden
      bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50
      dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-40"></div>
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        variant="overlay"
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="pt-24 md:pt-28 relative z-10 flex flex-col lg:flex-row min-h-screen">
        <div className="hidden lg:block w-[250px] flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 px-4 sm:px-6 pb-12 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
              <WalletIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Withdrawal</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your balance and withdrawal requests
              </p>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-emerald-100 text-sm font-semibold mb-2">Available Balance</p>
                {loading ? (
                  <div className="h-12 w-48 bg-emerald-400/30 rounded-lg animate-pulse"></div>
                ) : (
                  <p className="text-5xl font-black">
                    {formatCurrency(walletBalance?.balance || 0)}
                  </p>
                )}
              </div>
              <WalletIcon className="w-16 h-16 text-emerald-100 opacity-50" />
            </div>
            {walletBalance && (
              <div className="flex gap-6 text-emerald-100 text-sm">
                <div>
                  <span className="opacity-75">Total Earned: </span>
                  <span className="font-semibold">{formatCurrency(walletBalance.totalEarned || 0)}</span>
                </div>
                <div>
                  <span className="opacity-75">Total Withdrawn: </span>
                  <span className="font-semibold">{formatCurrency(walletBalance.totalWithdrawn || 0)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Withdrawal Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <ArrowDown className="w-6 h-6 text-emerald-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw Money</h2>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Amount (VND)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (20,000 - 500,000)"
                    min="20000"
                    max="500000"
                    step="1000"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum: 20,000 VND | Maximum: 500,000 VND
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter bank account number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || loading || !walletBalance || (walletBalance.balance < 20000)}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                    submitting || loading || !walletBalance || (walletBalance.balance < 20000)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {submitting ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </form>
            </div>

            {/* Withdrawal History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-emerald-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawal History</h2>
              </div>

              {loadingWithdrawals ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <WalletIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No withdrawal requests yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {withdrawals.map((withdrawal) => (
                      <div
                        key={withdrawal._id}
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={getStatusBadge(withdrawal.Status)}>
                                {getStatusText(withdrawal.Status)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(withdrawal.createdAt)}
                              </span>
                            </div>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                              {formatCurrency(withdrawal.Amount)}
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p><span className="font-semibold">Bank:</span> {withdrawal.BankName}</p>
                              <p><span className="font-semibold">Account:</span> {withdrawal.AccountNumber}</p>
                              <p><span className="font-semibold">Recipient:</span> {withdrawal.RecipientName}</p>
                            </div>
                          </div>
                        </div>
                        {withdrawal.RejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-xs text-red-700 dark:text-red-400">
                              <span className="font-semibold">Reason:</span> {withdrawal.RejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {page} / {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
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

export default Withdrawal;

