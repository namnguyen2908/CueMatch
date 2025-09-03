// src/components/Header/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Search, MessageCircle, Bell, Target } from "lucide-react";
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';

const Header = () => {
  const [focused, setFocused] = useState(false);
  const notifications = 3;
  const { datauser } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

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
                   bg-gradient-to-br from-[#0c0c0c]/90 via-[#1a1a1a]/90 to-[#0c0c0c]/90
                   border-b border-yellow-500/30 backdrop-blur-2xl shadow-[0_2px_12px_rgba(255,215,0,0.1)]">
      <div className="max-w-8xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between w-full">

          {/* Bên trái: Logo + Search */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3 " onClick={() => navigate('/homefeed')}>
              <div className="w-10 h-10 rounded-full border border-yellow-400/60 
                bg-gradient-to-br from-[#111] via-[#1a1a1a] to-[#111] 
                flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.2)] animate-pulse-slow">

                <Target className="w-6 h-6 text-yellow-400 spin-slow" />
              </div>
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text 
               bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 
               underline-shimmer drop-shadow-[0_1px_4px_rgba(255,215,0,0.5)] tracking-wide">

                CueMatch
              </h1>
            </div>

            {/* Search */}
            <div className="ml-6 w-[28rem]">
              <div className={`relative transition-transform duration-300 ${focused ? "scale-105" : ""}`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  type="text"
                  placeholder="Search tournaments, players…"
                  className="w-full pl-12 pr-4 py-2 rounded-full bg-[#1c1c1c]/80 text-gray-200
             focus:outline-none focus:ring-2 focus:ring-yellow-400/80 
             border border-yellow-500/20 transition-all
             shadow-inner hover:shadow-[0_0_8px_rgba(255,215,0,0.3)]"
                />

              </div>
            </div>
          </div>

          {/* Bên phải: Actions */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button className="relative p-2 text-gray-300 hover:text-yellow-400 
                   hover:scale-110 transition-all duration-300 
                   hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]">
              <MessageCircle className="w-6 h-6 drop-shadow" />
            </button>
            <button className="relative p-2 text-gray-300 hover:text-yellow-400 
                   hover:scale-110 transition-all duration-300 
                   hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs 
                             rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {notifications}
                </span>
              )}
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-yellow-400 
                shadow-[0_0_6px_rgba(255,215,0,0.4)] hover:shadow-[0_0_10px_rgba(255,215,0,0.6)] transition-shadow"
              onClick={() => setDropdownOpen(!dropdownOpen)}>
              <img
                src={datauser.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-48 w-44 bg-[#1a1a1a]/95 border border-yellow-500/40 rounded-md shadow-lg text-yellow-300 z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-yellow-500/20"
                  onClick={() => {
                    // Ví dụ: chuyển đến trang profile
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-yellow-500/20"
                  onClick={() => {
                    // Ví dụ: chuyển đến trang settings
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
                    // Ví dụ: logout action
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