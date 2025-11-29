import React, { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import billiardsBookingApi from '../api/billiardsBookingApi';
import { Calendar, MapPin, Clock, DollarSign, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';

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
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (hour) => {
  if (hour == null) return '--';
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const getStatusBadge = (status) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1";
  switch (status) {
    case 'confirmed':
      return `${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
    case 'checked-in':
      return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
    case 'completed':
      return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
    case 'cancelled':
      return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
    case 'pending':
      return `${baseClasses} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'checked-in':
      return 'Checked In';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending,confirmed');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState({ type: '', text: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await billiardsBookingApi.getUserBookings({ status: statusFilter });
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setCancelMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setCancelMessage({ type: '', text: '' });
      
      const response = await billiardsBookingApi.cancelBooking(bookingId);
      
      setCancelMessage({ 
        type: 'success', 
        text: response.message || 'Booking cancelled successfully' 
      });
      
      // Refresh bookings
      fetchBookings();
      
      // Clear message after 5 seconds
      setTimeout(() => setCancelMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setCancelMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to cancel booking' 
      });
      setTimeout(() => setCancelMessage({ type: '', text: '' }), 5000);
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (booking) => {
    // Can cancel if status is pending or confirmed
    if (!['pending', 'confirmed'].includes(booking.Status)) {
      return false;
    }

    // Check if cancellation is at least 1 hour before start time
    const now = new Date();
    const bookingDate = new Date(booking.BookingDate);
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(booking.StartHour, 0, 0, 0);

    const timeUntilStart = startDateTime - now;
    const oneHourInMs = 60 * 60 * 1000;

    return timeUntilStart >= oneHourInMs;
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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Bookings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View and manage your table bookings
              </p>
            </div>
          </div>

          {/* Status Message */}
          {cancelMessage.text && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${
              cancelMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              {cancelMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${
                cancelMessage.type === 'success' 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {cancelMessage.text}
              </p>
            </div>
          )}

          {/* Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Filter by status:
              </span>
              <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('pending,confirmed')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    statusFilter === 'pending,confirmed'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Active
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
                  onClick={() => setStatusFilter('cancelled')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    statusFilter === 'cancelled'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Cancelled
                </button>
                <button
                  onClick={() => setStatusFilter('pending,confirmed,completed,cancelled')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    statusFilter === 'pending,confirmed,completed,cancelled'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                  No bookings found
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  {statusFilter ? 'No bookings with this status' : 'You haven\'t made any bookings yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className={getStatusBadge(booking.Status)}>
                            {getStatusText(booking.Status)}
                          </span>
                        </div>

                        <div className="mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                            {booking.Club?.Name || 'Billiards Club'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm">
                            <div className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-semibold">Date:</span> {formatDate(booking.BookingDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-semibold">Time:</span> {formatTime(booking.StartHour)} - {formatTime(booking.EndHour)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-semibold">Location:</span> {booking.Club?.Address || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-semibold">Amount:</span> {formatCurrency(booking.TotalAmount || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                          {booking.Table && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <span className="font-semibold">Table:</span> {booking.Table.TableNumber} ({booking.Table.Type})
                            </p>
                          )}
                          {booking.Note && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <span className="font-semibold">Note:</span> {booking.Note}
                            </p>
                          )}
                        </div>
                      </div>

                      {canCancel(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                        >
                          <XCircle className="w-4 h-4" />
                          {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;

