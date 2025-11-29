import React, { useState, useRef, useEffect } from "react";
import { Bell, Sun, Moon, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';
import { useTheme } from '../../contexts/ThemeContext';
import socket from '../../socket';
import NotificationDropdown from '../Notification/NotificationDropdown';
import notificationApi from '../../api/notificationApi';

const PartnerHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { datauser } = useUser();
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationApi.getUnreadCount();
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (datauser?.id) {
      fetchUnreadCount();
      
      // Refresh count periodically
      const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds

      // Listen for new notifications
      const handleNewNotification = () => {
        fetchUnreadCount();
      };

      socket.on('new_notification', handleNewNotification);

      return () => {
        clearInterval(interval);
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [datauser?.id]);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo or title */}
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              Partner Dashboard
            </h2>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800
                hover:bg-gray-200 dark:hover:bg-gray-700
                text-gray-700 dark:text-gray-300 
                transition-all duration-200
                shadow-sm hover:shadow-md"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  text-gray-700 dark:text-gray-300 
                  transition-all duration-200
                  shadow-sm hover:shadow-md"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                      rounded-full min-w-[20px] h-5 flex items-center justify-center px-1
                      shadow-lg font-bold ring-2 ring-white dark:ring-gray-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>
              <NotificationDropdown 
                isOpen={notificationOpen} 
                onClose={() => setNotificationOpen(false)}
                onUnreadCountChange={setUnreadCount}
              />
            </div>

            {/* User Avatar & Dropdown */}
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-10 h-10 rounded-xl overflow-hidden 
                border-2 border-indigo-300 dark:border-indigo-700
                shadow-md hover:shadow-lg
                transition-all duration-200 cursor-pointer
                ring-2 ring-transparent hover:ring-indigo-300/50 dark:hover:ring-indigo-700/50
                group/avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img 
                src={datauser?.avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-300" 
              />
            </motion.div>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ y: -10, scale: 0.95, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: -10, scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-3 w-56 
                              bg-white dark:bg-gray-800
                              rounded-2xl shadow-xl overflow-hidden z-50
                              border border-gray-200/30 dark:border-gray-700/30"
                >
                  <div className="p-2">
                    <motion.button
                      whileHover={{ x: 4, scale: 1.02 }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                        text-gray-700 dark:text-gray-200
                        hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                        transition-all duration-200 group"
                      onClick={() => {
                        navigate('/profile');
                        setDropdownOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Profile</span>
                    </motion.button>
                    <div className="divider my-2 border-t border-gray-200 dark:border-gray-700"></div>
                    <motion.button
                      whileHover={{ x: 4, scale: 1.02 }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                        text-red-500 dark:text-red-400
                        hover:bg-red-50 dark:hover:bg-red-500/10
                        transition-all duration-200 font-medium group"
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Logout</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PartnerHeader;

