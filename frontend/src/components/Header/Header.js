import React, { useState, useRef, useEffect } from "react";
import { Search, MessageCircle, Bell, Target, Sun, Moon } from "lucide-react";
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';
import { useTheme } from '../../contexts/ThemeContext';
import socket from '../../socket';

const Header = () => {
  const [focused, setFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { datauser } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const notifications = 3;

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 
    bg-[#f7f9fc] dark:bg-[#242424] text-orange-900 dark:text-yellow-100 
    backdrop-blur-2xl shadow-md transition-colors duration-300">

      <div className="max-w-8xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between w-full">

          {/* Logo + Search */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/homefeed')}>
              <div className="w-10 h-10 rounded-full border border-orange-600/60 
  bg-gradient-to-br from-[#111] via-[#1a1a1a] to-[#111] 
  flex items-center justify-center shadow-[0_0_12px_rgba(234,88,12,0.3)] animate-pulse-slow">
                <Target className="w-6 h-6 text-orange-600 spin-slow" />
              </div>

              <h1
                className="cursor-default text-2xl font-extrabold text-transparent bg-clip-text
    bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600
    bg-[length:200%_100%] animate-shimmer
    tracking-wide drop-shadow-[0_1px_6px_rgba(234,88,12,0.8)]"
              >
                CueMatch
              </h1>
            </div>

            {/* Search */}
            <div className="ml-6 w-[28rem]">
              <div className={`relative transition-transform duration-300 ${focused ? "scale-105" : ""}`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 w-5 h-5" />
                <input
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
  type="text"
  placeholder="Search tournaments, players…"
  className="w-full pl-12 pr-4 py-2 rounded-full
    bg-transparent
    text-orange-900 dark:text-orange-300
    placeholder-orange-400 dark:placeholder-orange-500
    focus:outline-none focus:ring-2 focus:ring-orange-500/80
    border-[2px] border-orange-300 dark:border-orange-700
    transition-all shadow-inner hover:shadow-[0_0_8px_rgba(234,88,12,0.4)]"
/>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button
              onClick={toggleTheme}
              className="p-2 hover:rotate-12 hover:scale-110 transition-all duration-300"
            >
              {theme === 'dark' ? (
                <Sun className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
              ) : (
                <Moon className="w-6 h-6 text-blue-500 drop-shadow-[0_0_6px_rgba(100,200,255,0.5)]" />
              )}
            </button>

            <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-400 hover:scale-110 transition-all duration-300">
              <MessageCircle className="w-6 h-6" />
            </button>

            <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-400 hover:scale-110 transition-all duration-300">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs 
                  rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {notifications}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-yellow-400 
              shadow-[0_0_6px_rgba(255,215,0,0.4)] hover:shadow-[0_0_10px_rgba(255,215,0,0.6)] transition-shadow cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img src={datauser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-48 w-44 
                bg-white dark:bg-[#1a1a1a] border border-yellow-500/40 
                rounded-md shadow-lg text-black dark:text-yellow-300 z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-yellow-500/20"
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-yellow-500/20"
                  onClick={() => {
                    console.log("Settings clicked");
                    setDropdownOpen(false);
                  }}
                >
                  Settings
                </button>
                <hr className="border-yellow-500/20 my-1" />
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-yellow-500/40 text-red-500 font-semibold"
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;