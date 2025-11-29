import React, { useEffect, useState } from 'react';
import PartnerLayout from './PartnerLayout';
import { FaChair, FaMoneyBillWave, FaCalendarCheck, FaUsers, FaChartBar } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import billiardsBookingApi from '../../api/billiardsBookingApi';
import billiardsClubApi from '../../api/billiardsClubApi';
import userApi from '../../api/userApi';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const ClubDashboard = () => {
    const { datauser } = useUser();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [clubId, setClubId] = useState(null);
    const [revenuePeriod, setRevenuePeriod] = useState('day');
    const [revenueData, setRevenueData] = useState(null);
    const [loadingRevenue, setLoadingRevenue] = useState(false);
    const [walletBalance, setWalletBalance] = useState(null);
    const [loadingWallet, setLoadingWallet] = useState(false);

    useEffect(() => {
        const fetchClubId = async () => {
            try {
                let id = datauser?.clubId;
                if (!id) {
                    const clubs = await billiardsClubApi.getMyClubs();
                    if (clubs && clubs.length > 0) id = clubs[0]._id;
                }
                if (id) {
                    setClubId(id);
                    const data = await billiardsBookingApi.getDashboardStats(id);
                    setStats(data);
                    const revenueRes = await billiardsBookingApi.getRevenueByTime(id, revenuePeriod);
                    setRevenueData(revenueRes.revenueData);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchClubId();
    }, [datauser]);

    useEffect(() => {
        if (!clubId) return;
        const fetchRevenueData = async () => {
            try {
                setLoadingRevenue(true);
                const res = await billiardsBookingApi.getRevenueByTime(clubId, revenuePeriod);
                setRevenueData(res.revenueData);
            } catch (error) {
                console.error('Error fetching revenue data:', error);
            } finally {
                setLoadingRevenue(false);
            }
        };
        fetchRevenueData();
    }, [clubId, revenuePeriod]);

    if (loading) {
        return (
            <PartnerLayout>
                <div className="p-6 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
                    </div>
                </div>
            </PartnerLayout>
        );
    }

    if (!stats) {
        return (
            <PartnerLayout>
                <div className="p-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <p className="text-red-700 dark:text-red-400">Unable to load statistics</p>
                    </div>
                </div>
            </PartnerLayout>
        );
    }

    const tableTypeChartData = {
        labels: ['Pool', 'Carom', 'Snooker'],
        datasets: [
            {
                label: 'Play Count',
                data: [
                    stats.tableTypeStats.Pool.count,
                    stats.tableTypeStats.Carom.count,
                    stats.tableTypeStats.Snooker.count
                ],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(251, 146, 60, 1)'
                ],
                borderWidth: 2
            }
        ]
    };

    const tableRevenueChartData = {
        labels: ['Pool', 'Carom', 'Snooker'],
        datasets: [
            {
                label: 'Revenue (VND)',
                data: [
                    stats.tableTypeStats.Pool.revenue,
                    stats.tableTypeStats.Carom.revenue,
                    stats.tableTypeStats.Snooker.revenue
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(168, 85, 247, 1)'
                ],
                borderWidth: 2
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Table Type Statistics',
                font: { size: 16, weight: 'bold' }
            }
        }
    };

    const barChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: { ...chartOptions.plugins.title, text: 'Revenue by Table Type' }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    return (
        <PartnerLayout>
            <div className="p-6 space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-indigo-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <FaChair className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Table in play
                        </h3>
                        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            {stats.activeBookings || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Number of tables currently occupied
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <FaMoneyBillWave className="text-green-600 dark:text-green-400 w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Total revenue
                        </h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(stats.totalRevenue)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Total revenue from completed bookings
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <FaCalendarCheck className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Table Reservation Schedule
                        </h3>
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                            {stats.confirmedBookings || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Number of booked appointments (not checked-in)
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <FaChartBar className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Total bookings
                        </h3>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.totalBookings || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Total number of completed bookings
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <FaMoneyBillWave className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Wallet Balance
                        </h3>
                        {loadingWallet ? (
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                ...
                            </p>
                        ) : (
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(walletBalance?.balance || 0)}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {walletBalance ? `Total earned: ${formatCurrency(walletBalance.totalEarned || 0)}` : 'Available balance'}
                        </p>
                    </div>
                </div>

                {/* Revenue Chart with Filter */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Revenue chart
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Display by:</span>
                            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setRevenuePeriod('day')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        revenuePeriod === 'day'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Day
                                </button>
                                <button
                                    onClick={() => setRevenuePeriod('week')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        revenuePeriod === 'week'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setRevenuePeriod('month')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        revenuePeriod === 'month'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Month
                                </button>
                            </div>
                        </div>
                    </div>

                    {loadingRevenue ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                            </div>
                        </div>
                    ) : revenueData && revenueData.length > 0 ? (
                        <div className="h-80">
                            <Line
                                data={{
                                    labels: revenueData.map(item => item.label),
                                    datasets: [
                                        {
                                            label: 'Revenue (VND)',
                                            data: revenueData.map(item => item.revenue),
                                            borderColor: 'rgba(99, 102, 241, 1)',
                                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                            borderWidth: 3,
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 4,
                                            pointHoverRadius: 6,
                                            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 2
                                        }
                                    ]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'top',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    return `Doanh thu: ${formatCurrency(context.parsed.y)}`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: function(value) {
                                                    if (value >= 1000000) {
                                                        return (value / 1000000).toFixed(1) + 'M';
                                                    } else if (value >= 1000) {
                                                        return (value / 1000).toFixed(0) + 'K';
                                                    }
                                                    return value;
                                                }
                                            },
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.05)'
                                            }
                                        },
                                        x: {
                                            grid: {
                                                display: false
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center">
                            <div className="text-center">
                                <FaChartBar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No revenue data yet
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today</p>
                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(stats.revenueToday)}
                                    </p>
                                </div>
                                <FaMoneyBillWave className="text-blue-500 w-8 h-8" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This week</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(stats.revenueThisWeek)}
                                    </p>
                                </div>
                                <FaMoneyBillWave className="text-green-500 w-8 h-8" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This month</p>
                                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                        {formatCurrency(stats.revenueThisMonth)}
                                    </p>
                                </div>
                                <FaMoneyBillWave className="text-purple-500 w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart - Số lần chơi theo loại bàn */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Statistics of number of playing by table type
                        </h3>
                        <div className="h-80">
                            <Pie data={tableTypeChartData} options={chartOptions} />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pool</p>
                                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                    {stats.tableTypeStats.Pool.count}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Carom</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {stats.tableTypeStats.Carom.count}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Snooker</p>
                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                    {stats.tableTypeStats.Snooker.count}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart - Doanh thu theo loại bàn */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Revenue by table type
                        </h3>
                        <div className="h-80">
                            <Bar data={tableRevenueChartData} options={barChartOptions} />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pool</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(stats.tableTypeStats.Pool.revenue)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Carom</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(stats.tableTypeStats.Carom.revenue)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Snooker</p>
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {formatCurrency(stats.tableTypeStats.Snooker.revenue)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <FaUsers className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Loyal customers
                        </h3>
                    </div>

                    {stats.topCustomers && stats.topCustomers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Number of visits
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Total expenditure
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Last visit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {stats.topCustomers.map((customer, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={customer.user?.Avatar}
                                                        alt={customer.user?.Name}
                                                        className="w-10 h-10 rounded-full object-cover mr-3"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {customer.user?.Name || 'Khách vãng lai'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {customer.user?.Email || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                    {customer.visitCount} times
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(customer.totalSpent)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(customer.lastVisit)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaUsers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No customer data available
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PartnerLayout>
    );
};

export default ClubDashboard;