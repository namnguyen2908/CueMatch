import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import tableApi from '../../api/tableApi';
import tableRateApi from '../../api/tableRateApi';
import billiardsBookingApi from '../../api/billiardsBookingApi';
import { FaTrash, FaPlus, FaEdit, FaDollarSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';
import Carrom from '../../assets/Carrom.png';
import Pool from '../../assets/Pool.png';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const BilliardsTableManagement = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState({
        occupied: false,
        available: false,
    });


    // Walk-in bookings currently active
    const [activeWalkInBookings, setActiveWalkInBookings] = useState([]);
    const [modalEndOpen, setModalEndOpen] = useState(false);
    const [endBookingInfo, setEndBookingInfo] = useState(null);
    ////

    const { datauser } = useUser();
    const clubId = datauser?.clubId;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        TableNumber: '',
        Type: 'Pool',
        Status: 'available',
    });
    const [editingTableId, setEditingTableId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [priceModalOpen, setPriceModalOpen] = useState(false);
    const [tablePrices, setTablePrices] = useState({
        Pool: '',
        Carom: '',
        Snooker: '',
    });
    const [priceLoading, setPriceLoading] = useState(false);



    // Thống kê số bàn theo trạng thái
    const tableStatusStats = {
        available: tables.filter((t) => t.Status === 'available').length,
        reserved: tables.filter((t) => t.Status === 'reserved').length,
        occupied: tables.filter((t) => t.Status === 'occupied').length,
    };

    // Thống kê theo loại bàn
    const tableTypeStats = {
        Pool: tables.filter((t) => t.Type === 'Pool').length,
        Carom: tables.filter((t) => t.Type === 'Carom').length,
        Snooker: tables.filter((t) => t.Type === 'Snooker').length,
    };


    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const data = await tableApi.getTableByClub(clubId);
            setTables(data);
        } catch (error) {
            toast.error('Failed to fetch tables');
        } finally {
            setLoading(false);
        }
    };

    const handlePrepareEndPlay = async (bookingId) => {
        try {
            const res = await billiardsBookingApi.previewEndPlay(bookingId);
            setEndBookingInfo(res);  // res có: booking, duration, rate, totalAmountEstimate
            setModalEndOpen(true);
        } catch (err) {
            toast.error(err?.message || 'Lỗi khi lấy thông tin kết thúc');
        }
    };

    const handleOpenTable = async (tableId) => {
        try {
            const now = new Date();
            const res = await billiardsBookingApi.openNow({
                tableId,
                clubId,
                startTime: now.toISOString(),
            });

            toast.success("Đã mở bàn thành công");
            fetchTables(); // Cập nhật trạng thái
            setActiveWalkInBookings(prev => [...prev, res.booking]);
        } catch (err) {
            toast.error(err || "Không thể mở bàn");
        }
    };

    const handleEndPlay = async (bookingId) => {
        try {
            console.log("Kết thúc booking ID:", bookingId);  // Kiểm tra log
            const res = await billiardsBookingApi.endPlay(bookingId);
            toast.success(`Đã kết thúc bàn. Tổng tiền: ${res.totalAmount} VND`);

            fetchTables();  // cập nhật lại bảng
            setActiveWalkInBookings(prev => prev.filter(b => b._id !== bookingId));
            setModalEndOpen(false); // Đóng modal sau khi kết thúc
        } catch (err) {
            console.error("Lỗi khi kết thúc bàn:", err);
            toast.error(err?.response?.data?.message || "Không thể kết thúc bàn");
        }
    };


    const fetchTablePrices = async () => {
        setPriceLoading(true);
        try {
            const [pool, carom, snooker] = await Promise.all([
                tableRateApi.getTableRate(clubId, 'Pool').catch(() => null),
                tableRateApi.getTableRate(clubId, 'Carom').catch(() => null),
                tableRateApi.getTableRate(clubId, 'Snooker').catch(() => null),
            ]);

            setTablePrices({
                Pool: pool?.data?.PricePerHour || '',
                Carom: carom?.data?.PricePerHour || '',
                Snooker: snooker?.data?.PricePerHour || '',
            });
        } catch (err) {
            toast.error('Failed to load table prices');
        } finally {
            setPriceLoading(false);
        }
    };

    useEffect(() => {
        if (priceModalOpen && clubId) {
            fetchTablePrices();
        }
    }, [priceModalOpen, clubId]);


    const handleSavePrices = async () => {
        try {
            for (const type of ['Pool', 'Carom', 'Snooker']) {
                const price = tablePrices[type];
                if (!price || isNaN(price)) continue;

                await tableRateApi.updateTableRate(clubId, type, {
                    PricePerHour: parseInt(price),
                }).catch(async (err) => {
                    if (err.response?.status === 404) {
                        await tableRateApi.createTableRate(clubId, {
                            Type: type,
                            PricePerHour: parseInt(price),
                        });
                    }
                });
            }

            toast.success('Prices updated successfully');
            setPriceModalOpen(false);
        } catch (error) {
            toast.error('Failed to update prices');
        }
    };


    const getTableImage = (type) => {
        switch (type) {
            case 'Pool':
                return Pool;
            case 'Carom':
                return Carrom;
            case 'Snooker':
                return Pool;
            default:
                return Pool;
        }
    };

    useEffect(() => {
        if (clubId) fetchTables();
    }, [clubId]);

    const filteredTables = tables.filter((table) => {
        const matchNumber = table.TableNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType ? table.Type === filterType : true;

        const statusFilters = Object.entries(filterStatus).filter(([_, value]) => value).map(([key]) => key);
        const matchStatus = statusFilters.length > 0 ? statusFilters.includes(table.Status) : true;

        return matchNumber && matchType && matchStatus;
    });


    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this table?')) return;
        setDeletingId(id);
        try {
            await tableApi.deleteTable(id);
            toast.success('Table deleted successfully');
            fetchTables();
        } catch (error) {
            toast.error('Failed to delete table');
        } finally {
            setDeletingId(null);
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setFormData({ TableNumber: '', Type: 'Pool' });
        setEditingTableId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (table) => {
        setEditMode(true);
        setFormData({
            TableNumber: table.TableNumber,
            Type: table.Type,
            Status: table.Status || 'available',
        });
        setEditingTableId(table._id);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!formData.TableNumber.trim()) {
            toast.warning('Please enter a table number');
            return;
        }

        setSubmitting(true);
        try {
            if (editMode) {
                await tableApi.updateTable(editingTableId, formData);
                toast.success('Table updated successfully');
            } else {
                await tableApi.createTable({ ...formData, Club: clubId });
                toast.success('Table created successfully');
            }

            setIsModalOpen(false);
            fetchTables();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
            <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <main
                className="flex flex-col flex-1 overflow-auto transition-all duration-300 p-8"
                style={{ marginLeft: sidebarOpen ? '16rem' : '4rem' }}
            >
                {/* Header Section */}
                <div className="mb-8">

                    <button
                        onClick={() => setPriceModalOpen(true)}
                        className="fixed bottom-24 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-2xl"
                        title="Manage Table Prices"
                    >
                        <FaDollarSign />
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-2xl"
                        title="Add New Table"
                    >
                        <FaPlus />
                    </button>
                    {/* Filter Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            {/* Search input */}
                            <div className="relative flex-1 w-full">
                                <input
                                    type="text"
                                    placeholder="Search by table number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all outline-none"
                                />
                                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* Filter by Type */}
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full lg:w-48 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all outline-none cursor-pointer"
                            >
                                <option value="">All Table Types</option>
                                <option value="Pool">Pool</option>
                                <option value="Carom">Carom</option>
                                <option value="Snooker">Snooker</option>
                            </select>

                            {/* Filter by Status */}
                            <div className="flex gap-6 items-center">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filterStatus.occupied}
                                        onChange={(e) => setFilterStatus(prev => ({ ...prev, occupied: e.target.checked }))}
                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Playing</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filterStatus.available}
                                        onChange={(e) => setFilterStatus(prev => ({ ...prev, available: e.target.checked }))}
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Empty table</span>
                                </label>
                            </div>

                        </div>
                    </div>
                </div>

                {/* BIỂU ĐỒ THỐNG KÊ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Pie chart - Trạng thái bàn */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Table Status Overview
                        </h3>
                        <div className="h-64"> {/* 👈 Thêm wrapper có chiều cao */}
                            <Pie
                                data={{
                                    labels: ['Available', 'Reserved', 'Occupied'],
                                    datasets: [
                                        {
                                            label: 'Tables',
                                            data: [
                                                tableStatusStats.available,
                                                tableStatusStats.reserved,
                                                tableStatusStats.occupied,
                                            ],
                                            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                                            borderWidth: 1,
                                        },
                                    ],
                                }}
                                options={{
                                    maintainAspectRatio: false, // 👈 Bắt buộc nếu bạn giới hạn chiều cao
                                }}
                            />
                        </div>
                    </div>


                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Table Type Count
                        </h3>
                        <div className="h-64"> {/* 👈 wrapper cố định chiều cao */}
                            <Bar
                                data={{
                                    labels: ['Pool', 'Carom', 'Snooker', 'Total'],
                                    datasets: [
                                        {
                                            label: 'Number of Tables',
                                            data: [
                                                tableTypeStats.Pool,
                                                tableTypeStats.Carom,
                                                tableTypeStats.Snooker,
                                                tables.length,
                                            ],
                                            backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'],
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false, // 👈 Cần thiết
                                    plugins: {
                                        legend: { display: false },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">Loading tables...</p>
                    </div>
                ) : tables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-xl font-medium">No tables created yet</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Click "Add New Table" to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTables.map((table) => (
                            <div
                                key={table._id}
                                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-2"
                            >
                                {/* Image */}
                                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 flex items-center justify-center h-48 overflow-hidden">
                                    <img
                                        src={getTableImage(table.Type)}
                                        alt={table.Type}
                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 shadow-md">
                                            {table.Type}
                                        </span>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="p-5">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                            Table #{table.TableNumber}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${table.Status === 'available'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : table.Status === 'reserved'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full mr-2 ${table.Status === 'available'
                                                ? 'bg-emerald-500'
                                                : table.Status === 'reserved'
                                                    ? 'bg-amber-500'
                                                    : 'bg-rose-500'
                                                }`}></span>
                                            {table.Status === 'available'
                                                ? 'Available'
                                                : table.Status === 'reserved'
                                                    ? 'Reserved'
                                                    : 'Occupied'}
                                        </span>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-col">
                                        {table.Status === 'available' && (
                                            <button
                                                onClick={() => handleOpenTable(table._id)}
                                                className="w-full flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
                                            >
                                                <FaPlus />
                                                <span>Open Now</span>
                                            </button>
                                        )}
                                        {table.Status === 'occupied' && table.activeBooking && (
                                            <button
                                                onClick={() => handlePrepareEndPlay(table.activeBooking._id)}
                                                className="w-full flex items-center justify-center gap-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
                                            >
                                                <FaDollarSign />
                                                <span>End</span>
                                            </button>
                                        )}

                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => openEditModal(table)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
                                            >
                                                <FaEdit />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(table._id)}
                                                disabled={deletingId === table._id}
                                                className={`flex-1 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${deletingId === table._id ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                <FaTrash />
                                                <span>{deletingId === table._id ? 'Deleting...' : 'Delete'}</span>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            {/* Modal Create/Update */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl transform transition-all animate-slideUp">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 rounded-t-3xl">
                            <h2 className="text-3xl font-bold text-white">
                                {editMode ? 'Update Table' : 'Add New Table'}
                            </h2>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleModalSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Table Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.TableNumber}
                                    onChange={(e) => setFormData({ ...formData, TableNumber: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 outline-none"
                                    placeholder="Enter table number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Type
                                </label>
                                <select
                                    value={formData.Type}
                                    onChange={(e) => setFormData({ ...formData, Type: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 outline-none cursor-pointer"
                                >
                                    <option value="Pool">Pool</option>
                                    <option value="Carom">Carom</option>
                                    <option value="Snooker">Snooker</option>
                                </select>
                            </div>

                            {editMode && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.Status}
                                        onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 outline-none cursor-pointer"
                                    >
                                        <option value="available">Available</option>
                                        <option value="reserved">Reserved</option>
                                        <option value="occupied">Occupied</option>
                                    </select>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-gray-800 dark:text-gray-200 font-semibold transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {submitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {priceModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                            <h2 className="text-2xl font-bold text-white">
                                Manage Table Prices
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1">Set hourly rates for each table type</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-5">
                            {['Pool', 'Carom', 'Snooker'].map((type) => (
                                <div key={type}>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {type}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={tablePrices[type]}
                                            onChange={(e) =>
                                                setTablePrices({ ...tablePrices, [type]: e.target.value })
                                            }
                                            className="w-full px-4 py-3 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all outline-none"
                                            placeholder="Enter price..."
                                        />
                                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            VND/h
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 flex gap-4">
                            <button
                                onClick={() => setPriceModalOpen(false)}
                                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200 font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePrices}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                disabled={priceLoading}
                            >
                                {priceLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalEndOpen && endBookingInfo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">End Play Confirmation</h3>
                                    <p className="text-blue-100 text-sm mt-1">Please review session details before ending</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalEndOpen(false)}
                                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                            >
                                ✖
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Booking Details - 2 Columns Layout */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Table Number</p>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-white">#{endBookingInfo.booking.Table.TableNumber}</p>
                                    </div>

                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Table Type</p>
                                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{endBookingInfo.booking.Table.Type}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Duration</p>
                                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{endBookingInfo.durationMinutes} minutes</p>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Rate per Hour</p>
                                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{endBookingInfo.rate.PricePerHour.toLocaleString()} VND</p>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Estimated Total</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{endBookingInfo.totalAmountEstimate.toLocaleString()}</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">VND</p>
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    <span className="font-semibold">Note:</span> This is an estimated amount. Final charges may vary based on additional services.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setModalEndOpen(false)}
                                    className="px-8 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleEndPlay(endBookingInfo.booking._id)}
                                    className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                                >
                                    <span>✅</span>
                                    <span>Confirm End</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BilliardsTableManagement;