import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaUserCircle, FaTable, FaDollarSign, FaCalendarAlt, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { logout } from '../../api/authApi'
import socket from '../../socket';

const menuItems = [
    { name: 'Overview', icon: <FaTable />, route: '/club-dashboard' },
    { name: 'Table management', icon: <FaDollarSign />, route: '/club-dashboard/table-management' },
    { name: 'Booking', icon: <FaCalendarAlt />, route: '/club-dashboard/bookings' },
    { name: 'Profile', icon: <FaUserCircle />, route: '/club-dashboard/profile' },
];

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            socket.disconnect();
            localStorage.clear();
            navigate('/');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

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
                        Dashboard
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

            {/* Footer: Toggle Theme + Logout */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3 flex-shrink-0">
                <button
  onClick={toggleTheme}
  className={`flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none`}
  style={{
    gap: sidebarOpen ? '12px' : '0',
    justifyContent: sidebarOpen ? 'flex-start' : 'center',
  }}
  aria-label="Toggle Theme"
>
  {theme === 'dark' ? (
    <FaSun className="w-6 h-6 text-yellow-400" />
  ) : (
    <FaMoon className="w-6 h-6" />
  )}
  {sidebarOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
  
  {/* Toggle switch chỉ hiện khi sidebar mở */}
  {sidebarOpen && (
    <div
      className={`ml-auto w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${
        theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
          theme === 'dark' ? 'translate-x-5' : ''
        }`}
      />
    </div>
  )}
</button>


                <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-red-600 hover:text-red-800 transition-colors focus:outline-none"
                    style={{
                        gap: sidebarOpen ? '12px' : '0',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    }}
                >
                    <FaSignOutAlt className="w-6 h-6" />
                    {sidebarOpen && <span>Logout</span>}
                </button>
            </div>

        </aside>
    );
};

export default Sidebar;