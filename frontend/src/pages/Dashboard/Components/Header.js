// src/components/Header.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as logoutApi } from '../../../api/authApi';
import socket from '../../../socket';
import { useUser } from '../../../contexts/UserContext';

const Header = ({ toggleSidebar }) => {
  const { datauser } = useUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
      socket.disconnect();
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 border border-gray-300 rounded-lg"
            aria-label="Toggle sidebar"
          >
            <span className="sr-only">Toggle sidebar</span>
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <span className="w-full h-0.5 bg-gray-600"></span>
              <span className="w-full h-0.5 bg-gray-600"></span>
              <span className="w-full h-0.5 bg-gray-600"></span>
            </div>
          </button>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center space-x-3 border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
                {datauser?.avatar || datauser?.Avatar ? (
                  <img
                    src={datauser?.avatar || datauser?.Avatar}
                    alt={datauser?.name || datauser?.Name || 'User avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {datauser?.name || datauser?.Name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {datauser?.role || datauser?.Role || 'administrator'}
                </p>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg py-2 z-[1000]">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {datauser?.name || datauser?.Name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {datauser?.email || datauser?.Email || 'Admin account'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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