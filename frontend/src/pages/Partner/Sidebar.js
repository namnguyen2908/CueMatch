import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaUserCircle, FaTable, FaDollarSign, FaCalendarAlt, FaWallet } from 'react-icons/fa';

const menuItems = [
    { name: 'Overview', icon: <FaTable />, route: '/club-dashboard' },
    { name: 'Table management', icon: <FaDollarSign />, route: '/club-dashboard/table-management' },
    { name: 'Booking', icon: <FaCalendarAlt />, route: '/club-dashboard/bookings' },
    { name: 'Wallet', icon: <FaWallet />, route: '/club-dashboard/wallet' },
    { name: 'Profile', icon: <FaUserCircle />, route: '/club-dashboard/profile' },
    { name: 'HomeFeed', icon: <FaTable />, route: '/homefeed' },
];

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
    const location = useLocation();

    return (
        <aside
            className={`bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'
                } overflow-hidden flex flex-col justify-between min-h-screen fixed top-0 left-0`}
        >
            <div>
                {/* Header Sidebar */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1
                        className={`text-xl font-bold text-indigo-600 dark:text-indigo-400 ${sidebarOpen ? 'block' : 'hidden'
                            }`}
                    >
                        CueMatch
                    </h1>
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-500 dark:text-gray-300 focus:outline-none"
                        aria-label="Toggle Sidebar"
                    >
                        <FaBars size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4">
                    {menuItems.map((item) => (
                        <Link
                            to={item.route}
                            key={item.name}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${location.pathname === item.route
                                    ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 hover:text-indigo-700 dark:hover:text-indigo-300'
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span className={`${sidebarOpen ? 'inline' : 'hidden'}`}>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>


        </aside>
    );
};

export default Sidebar;