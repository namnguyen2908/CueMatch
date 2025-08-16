// src/components/Header.jsx
import React, { useState } from 'react';
import { Search, MessageCircle, Bell, Target } from 'lucide-react';

const Header = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState(3);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-400 via-orange-600 to-pink-400 shadow-lg z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:rotate-45 hover:scale-110 transition-all duration-500 hover:shadow-xl">
              <Target className="w-6 h-6 text-orange-600 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <h1 className="text-white font-bold text-xl tracking-wide">BiPool</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'transform scale-105' : ''}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm người chơi, tournament..."
                className="w-full pl-12 pr-4 py-2 bg-white/90 backdrop-blur rounded-full border-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all duration-300"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="relative p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </button>
            <div className="w-8 h-8 bg-white rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;