import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import withdrawalApi from '../../api/withdrawalApi';
import { CheckCircle2, XCircle, Clock, AlertCircle, Wallet, Search, Filter } from 'lucide-react';

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

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending'); // Default show pending
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(null); // withdrawalId being processed

  useEffect(() => {
    fetchWithdrawals();
  }, [page, statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await withdrawalApi.getAllWithdrawals(page, 20, statusFilter || null);
      if (response.success) {
        setWithdrawals(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    if (!window.confirm('Are you sure you want to approve this withdrawal request?')) {
      return;
    }

    try {
      setProcessing(withdrawalId);
      await withdrawalApi.approveWithdrawal(withdrawalId);
      alert('Withdrawal approved successfully!');
      fetchWithdrawals();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    try {
      setProcessing(selectedWithdrawal._id);
      await withdrawalApi.rejectWithdrawal(selectedWithdrawal._id, rejectReason);
      alert('Withdrawal rejected successfully!');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
    setRejectReason('');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Withdrawal Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Review and process partner withdrawal requests
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filter by status:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('processing')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'processing'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setStatusFilter('')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === ''
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading withdrawals...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="p-8 text-center">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                No withdrawal requests
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                {statusFilter ? 'No withdrawals with this status' : 'No withdrawal requests found'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal._id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={getStatusBadge(withdrawal.Status)}>
                            {getStatusText(withdrawal.Status)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(withdrawal.createdAt)}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                            {formatCurrency(withdrawal.Amount)}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 mb-1">
                                <span className="font-semibold">User:</span> {withdrawal.User?.Name || 'Unknown'} ({withdrawal.User?.Email || 'N/A'})
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 mb-1">
                                <span className="font-semibold">Recipient:</span> {withdrawal.RecipientName}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 mb-1">
                                <span className="font-semibold">Bank:</span> {withdrawal.BankName}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 mb-1">
                                <span className="font-semibold">Account:</span> {withdrawal.AccountNumber}
                              </p>
                            </div>
                          </div>
                        </div>

                        {withdrawal.ProcessedBy && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Processed by {withdrawal.ProcessedBy.Name} on {formatDate(withdrawal.ProcessedAt)}
                          </p>
                        )}

                        {withdrawal.RejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-xs text-red-700 dark:text-red-400">
                              <span className="font-semibold">Rejection Reason:</span> {withdrawal.RejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      {withdrawal.Status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleApprove(withdrawal._id)}
                            disabled={processing === withdrawal._id}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {processing === withdrawal._id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => openRejectModal(withdrawal)}
                            disabled={processing === withdrawal._id}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
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

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reject Withdrawal</h2>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Are you sure you want to reject this withdrawal request?
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {selectedWithdrawal?.User?.Name} ({selectedWithdrawal?.User?.Email})
                  </p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedWithdrawal?.Amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedWithdrawal?.BankName} - {selectedWithdrawal?.AccountNumber}
                  </p>
                </div>

                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedWithdrawal(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing === selectedWithdrawal?._id}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {processing === selectedWithdrawal?._id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WithdrawalManagement;

