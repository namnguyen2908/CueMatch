import React, { useEffect, useState } from 'react';
import billiardsBookingApi from '../../api/billiardsBookingApi';
import { FaCheckCircle, FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaClock, FaUser, FaFilter, FaTable } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import moment from 'moment';
import PartnerLayout from './PartnerLayout';
import ErrorToast from '../../components/ErrorToast/ErrorToast';

const statusBadgeColors = {
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    'checked-in': 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-200',
};

const BookingDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('confirmed,checked-in,completed');
    const [error, setError] = useState('');
    const { datauser } = useUser();
    const clubId = datauser?.clubId;
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'schedule'

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        if (!clubId) return;

        const fetchBookings = async () => {
            setLoading(true);
            try {
                const res = await billiardsBookingApi.getUserBookings({ status: statusFilter, clubId });
                setBookings(res.bookings || []);
                setCurrentPage(1);
            } catch (err) {
                setError(err?.message || 'Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [statusFilter, clubId]);

    const handleCheckIn = async (bookingId) => {
        try {
            await billiardsBookingApi.checkIn(bookingId);
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, Status: 'checked-in' } : b));
        } catch {
            alert('Check-in failed');
        }
    };

    const handleEndPlay = async (bookingId) => {
        try {
            const res = await billiardsBookingApi.endPlay(bookingId);
            alert(`Total amount: ${res.totalAmount} VND`);
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, Status: 'completed', TotalAmount: res.totalAmount } : b));
        } catch {
            alert('End play failed');
        }
    };

    const renderStatus = (status) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeColors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {status === 'confirmed' && '⏳ Confirmed'}
            {status === 'checked-in' && '✓ Playing'}
            {status === 'completed' && '✔ Completed'}
        </span>
    );

    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Group bookings by date and time slot
    const getBookingsByDate = () => {
        const bookingsByDate = {};
        bookings.forEach(booking => {
            const date = booking.BookingDate || moment(booking.StartTime).format('YYYY-MM-DD');
            if (!bookingsByDate[date]) {
                bookingsByDate[date] = [];
            }
            bookingsByDate[date].push(booking);
        });
        return bookingsByDate;
    };

    // Generate time slots (every hour from 6 AM to 11 PM)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 6; hour <= 23; hour++) {
            slots.push(hour);
        }
        return slots;
    };

    // Get bookings for a specific date and time slot
    const getBookingsForTimeSlot = (date, hour) => {
        return bookings.filter(booking => {
            const bookingDate = booking.BookingDate || moment(booking.StartTime).format('YYYY-MM-DD');
            const startHour = booking.StartHour || moment(booking.StartTime).hour();
            const endHour = booking.EndHour || (startHour + 1);
            return bookingDate === date && startHour <= hour && endHour > hour;
        });
    };

    const formatHour = (hour) => {
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    const bookingsByDate = getBookingsByDate();
    const timeSlots = generateTimeSlots();
    const selectedDateBookings = bookingsByDate[selectedDate] || [];

    return (
        <PartnerLayout>
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total booking</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{bookings.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FaCalendarAlt className="text-indigo-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Confirmed</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{bookings.filter(b => b.Status === 'confirmed').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaClock className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Playing</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{bookings.filter(b => b.Status === 'checked-in').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <FaSignInAlt className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gray-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{bookings.filter(b => b.Status === 'completed').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <FaCheckCircle className="text-gray-600 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FaFilter className="text-indigo-600" />
                        <h3 className="font-semibold text-gray-800">Filter by status</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setStatusFilter('confirmed,checked-in,completed')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${statusFilter.includes(',') ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            Total ({bookings.length})
                        </button>

                        <button onClick={() => setStatusFilter('confirmed')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${statusFilter === 'confirmed' ? 'bg-blue-600 text-white shadow-lg transform scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            Confirmed ({bookings.filter(b => b.Status === 'confirmed').length})
                        </button>

                        <button onClick={() => setStatusFilter('checked-in')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${statusFilter === 'checked-in' ? 'bg-green-600 text-white shadow-lg transform scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            Playing ({bookings.filter(b => b.Status === 'checked-in').length})
                        </button>

                        <button onClick={() => setStatusFilter('completed')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${statusFilter === 'completed' ? 'bg-gray-600 text-white shadow-lg transform scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            Completed ({bookings.filter(b => b.Status === 'completed').length})
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">Loading...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6">
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCalendarAlt className="text-gray-400 text-3xl" />
                        </div>
                        <p className="text-gray-600 text-lg">There are no bookings</p>
                        <p className="text-gray-400 text-sm mt-2">There are no bookings</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Placer</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Table</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {currentBookings.map((booking) => (
                                            <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                                            <FaUser className="text-white text-sm" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-800">{booking.User?.Name}</div>
                                                            <div className="text-gray-500 text-xs mt-1">{booking.User?.Email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-indigo-600 font-bold text-sm">{booking.Table?.TableNumber}</span>
                                                        </div>
                                                        <div className="text-gray-500 text-xs">{booking.Table?.Type}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                                                            <FaClock className="text-indigo-600 text-xs" />
                                                            {moment(booking.StartTime).format('HH:mm DD/MM/YYYY')}
                                                        </div>
                                                        <div className="text-xs text-gray-500 ml-5">
                                                            → {booking.EndTime ? moment(booking.EndTime).format('HH:mm DD/MM/YYYY') : 'Not finished yet'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">{renderStatus(booking.Status)}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        {!booking.IsWalkIn && booking.Status === 'confirmed' && (
                                                            <button onClick={() => handleCheckIn(booking._id)} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm">
                                                                <FaSignInAlt /> Check-in
                                                            </button>
                                                        )}
                                                        {booking.IsWalkIn && booking.Status === 'checked-in' && (
                                                            <button onClick={() => handleEndPlay(booking._id)} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm">
                                                                <FaSignOutAlt /> End Play
                                                            </button>
                                                        )}
                                                        {booking.Status === 'completed' && (
                                                            <div className="flex items-center gap-2 text-gray-400">
                                                                <FaCheckCircle className="text-xl" />
                                                                <span className="text-sm font-medium">Completed</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 font-medium">Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{i + 1}</button>
                                ))}
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 font-medium">Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <ErrorToast error={error} onClose={() => setError('')} />
        </PartnerLayout>
    );
};

export default BookingDashboard;