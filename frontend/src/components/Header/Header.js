import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, MessageCircle, Bell, Target, Sun, Moon, User, Settings, LogOut, Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';
import { useTheme } from '../../contexts/ThemeContext';
import socket from '../../socket';
import NotificationDropdown from '../Notification/NotificationDropdown';
import notificationApi from '../../api/notificationApi';

const Header = ({ onToggleSidebar }) => {
  const [focused, setFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [assistivePosition, setAssistivePosition] = useState(() => {
    if (typeof window === 'undefined') {
      return { x: 20, y: 200 };
    }
    return { x: window.innerWidth - 80, y: window.innerHeight - 180 };
  });
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));
  const dropdownRef = useRef(null);
  const assistiveDraggingRef = useRef(false);
  const assistiveDragOffsetRef = useRef({ x: 0, y: 0 });
  const assistiveMovedRef = useRef(false);
  const { datauser } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const clampAssistivePosition = useCallback(
    (position) => {
      const padding = 12;
      const buttonSize = 64;
      const minY = 90;
      const maxX = Math.max(padding, viewport.width - buttonSize - padding);
      const maxY = Math.max(minY, viewport.height - buttonSize - padding);
      return {
        x: Math.min(Math.max(padding, position.x), maxX),
        y: Math.min(Math.max(minY, position.y), maxY),
      };
    },
    [viewport]
  );

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setAssistivePosition((prev) => clampAssistivePosition(prev));
  }, [clampAssistivePosition]);

  const handleAssistivePointerMove = useCallback(
    (event) => {
      if (!assistiveDraggingRef.current) return;
      assistiveMovedRef.current = true;
      const nextPosition = {
        x: event.clientX - assistiveDragOffsetRef.current.x,
        y: event.clientY - assistiveDragOffsetRef.current.y,
      };
      setAssistivePosition(clampAssistivePosition(nextPosition));
    },
    [clampAssistivePosition]
  );

  const handleAssistivePointerUp = useCallback(() => {
    if (!assistiveDraggingRef.current) return;
    assistiveDraggingRef.current = false;
    window.removeEventListener('pointermove', handleAssistivePointerMove);
    window.removeEventListener('pointerup', handleAssistivePointerUp);
  }, [handleAssistivePointerMove]);

  const handleAssistivePointerDown = useCallback(
    (event) => {
      if (!onToggleSidebar) return;
      event.preventDefault();
      assistiveDraggingRef.current = true;
      assistiveMovedRef.current = false;
      assistiveDragOffsetRef.current = {
        x: event.clientX - assistivePosition.x,
        y: event.clientY - assistivePosition.y,
      };
      window.addEventListener('pointermove', handleAssistivePointerMove);
      window.addEventListener('pointerup', handleAssistivePointerUp);
    },
    [assistivePosition, handleAssistivePointerMove, handleAssistivePointerUp, onToggleSidebar]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleAssistivePointerMove);
      window.removeEventListener('pointerup', handleAssistivePointerUp);
    };
  }, [handleAssistivePointerMove, handleAssistivePointerUp]);

  const handleAssistiveClick = () => {
    if (assistiveMovedRef.current) {
      assistiveMovedRef.current = false;
      return;
    }
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const handleNavigateSearch = () => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsMobileSearchOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleNavigateSearch();
    }
  };

  const handleToggleMobileSearch = () => {
    setIsMobileSearchOpen((prev) => !prev);
  };

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

  useEffect(() => {
    if (!dropdownOpen) {
      setNotificationsPanelOpen(false);
    }
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
    <>
    <header className="fixed top-0 left-0 right-0 z-50 
      glass-card
      border-b border-sport-200/30 dark:border-sport-800/30
      shadow-luxury transition-all duration-300
      before:absolute before:inset-0 before:bg-mesh-light dark:before:bg-mesh-dark before:pointer-events-none">

      <div className="max-w-8xl mx-auto px-6 py-4 relative">
        <div className="flex items-center justify-between w-full">

          {/* Logo + Search */}
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/homefeed')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-sport-500 dark:bg-sport-600
                  flex items-center justify-center 
                  shadow-sport group-hover:shadow-sport-lg
                  ring-2 ring-sport-200/50 dark:ring-sport-800/50
                  group-hover:ring-sport-400/50 dark:group-hover:ring-sport-600/50
                  transition-all duration-300
                  relative overflow-hidden">
                  <Target className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
                </div>
              </div>

              <h1
                className="hidden lg:block cursor-default text-2xl font-display font-bold text-sport-600 dark:text-sport-400
                  tracking-tight drop-shadow-sm"
              >
                CueMatch
              </h1>
            </motion.div>

            {/* Search */}
            <div className="ml-0 lg:ml-6 hidden lg:block w-[32rem]">
              <motion.div
                className="relative"
                animate={{ scale: focused ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-400 dark:text-luxury-500 w-5 h-5 z-10" />
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={handleSearchKeyDown}
                  type="text"
                  placeholder="Search tournaments, players…"
                  className="input-elegant pl-12 pr-20 py-3
                    shadow-sm hover:shadow-md focus:shadow-sport
                    hover:border-sport-300 dark:hover:border-sport-700"
                />
              </motion.div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleMobileSearch}
              className="lg:hidden p-2.5 rounded-xl glass-card
                border border-sport-200/40 dark:border-sport-800/40
                text-luxury-600 dark:text-luxury-200
                shadow-sm"
            >
              <Search className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-11 h-11 rounded-xl overflow-hidden 
                border-2 border-sport-300 dark:border-sport-700
                shadow-sport hover:shadow-sport-lg
                transition-all duration-200 cursor-pointer
                ring-2 ring-transparent hover:ring-sport-300/50 dark:hover:ring-sport-700/50
                group/avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img src={datauser.avatar} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shadow-glow-orange">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </motion.div>

            {/* Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ y: -10, scale: 0.95 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-10 right-0 mt-3 w-[320px]
                              bg-white dark:bg-gray-800
                              rounded-2xl shadow-luxury-lg overflow-hidden z-50
                              border border-sport-200/30 dark:border-sport-800/30"
                >
                  <div className="p-2 bg-white dark:bg-gray-800 space-y-1.5">
                    <motion.button
                      whileHover={{ x: 4, scale: 1.02 }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                        text-luxury-700 dark:text-luxury-200
                        hover:bg-sport-50 dark:hover:bg-sport-900/20
                        transition-all duration-200 group"
                      onClick={() => {
                        navigate('/profile');
                        setDropdownOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 text-sport-500 dark:text-sport-400 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Profile</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 4, scale: 1.02 }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                        text-luxury-700 dark:text-luxury-200
                        hover:bg-sport-50 dark:hover:bg-sport-900/20
                        transition-all duration-200 group"
                      onClick={() => {
                        console.log("Settings clicked");
                        setDropdownOpen(false);
                      }}
                    >
                      <Settings className="w-4 h-4 text-sport-500 dark:text-sport-400 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Settings</span>
                    </motion.button>
                    <div className="divider-luxury my-2"></div>
                    <div className="px-4 py-3 rounded-xl glass-card space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-luxury-700 dark:text-luxury-100">Theme</p>
                          <p className="text-xs text-luxury-500 dark:text-luxury-400">
                            {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="p-2.5 rounded-xl bg-luxury-50 dark:bg-luxury-900 text-luxury-600 dark:text-luxury-200 shadow-sm border border-transparent hover:border-sport-200/40 dark:hover:border-sport-700/40 transition"
                        >
                          {theme === 'dark' ? <Sun className="w-5 h-5 text-gold-400" /> : <Moon className="w-5 h-5 text-luxury-600" />}
                        </button>
                      </div>
                      <motion.button
                        whileHover={{ x: 4, scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          navigate('/messages');
                          setDropdownOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-luxury-50/70 dark:bg-luxury-900/40 text-luxury-700 dark:text-luxury-200 border border-transparent hover:border-sport-200/40 dark:hover:border-sport-700/40 transition"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <MessageCircle className="w-4 h-4" /> Messages
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-70" />
                      </motion.button>
                      <motion.button
                        whileHover={{ x: 4, scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setNotificationsPanelOpen((prev) => !prev)}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-200/60 dark:border-amber-500/40 transition"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Bell className="w-4 h-4" /> Notifications
                        </span>
                        <span className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                          <ChevronDown className={`w-4 h-4 transition-transform ${notificationsPanelOpen ? 'rotate-180' : ''}`} />
                        </span>
                      </motion.button>
                      <AnimatePresence initial={false}>
                        {notificationsPanelOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden rounded-2xl border border-amber-100 dark:border-amber-500/40 bg-white/80 dark:bg-luxury-900/70"
                          >
                            <NotificationDropdown
                              variant="inline"
                              isOpen={notificationsPanelOpen}
                              onClose={() => setNotificationsPanelOpen(false)}
                              onUnreadCountChange={setUnreadCount}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="divider-luxury my-2"></div>
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
      <AnimatePresence>
        {isMobileSearchOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-luxury-900/60 dark:bg-black/70 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleToggleMobileSearch}
            />
            <motion.div
              className="fixed top-4 left-4 right-4 z-[70]"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              <div className="glass-card p-4 rounded-2xl border border-sport-200/40 dark:border-sport-800/40 shadow-luxury space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-400 dark:text-luxury-500 w-5 h-5" />
                    <input
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onKeyDown={handleSearchKeyDown}
                      type="text"
                      autoFocus
                      placeholder="Search tournaments, players…"
                      className="input-elegant pl-10 pr-4 py-3 w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleNavigateSearch}
                    className="px-4 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-sport-600 to-sport-500 shadow-sm hover:shadow-md focus:outline-none"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleMobileSearch}
                    className="p-3 rounded-xl bg-luxury-100 dark:bg-luxury-800 text-luxury-600 dark:text-luxury-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
    {onToggleSidebar && (
      <button
        type="button"
        aria-label="Toggle menu"
        onPointerDown={handleAssistivePointerDown}
        onClick={handleAssistiveClick}
        className="fixed lg:hidden z-50 w-14 h-14 rounded-full
          bg-gradient-to-br from-sport-500 to-sport-600
          text-white shadow-2xl border border-white/40
          backdrop-blur-md flex items-center justify-center
          active:scale-95 transition-transform"
        style={{ left: `${assistivePosition.x}px`, top: `${assistivePosition.y}px` }}
      >
        <Menu className="w-6 h-6" />
      </button>
    )}
    </>
  );
};

export default Header;