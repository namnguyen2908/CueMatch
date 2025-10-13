import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../../api/authApi';
import socket from '../../../socket';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
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


  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', },
    { name: 'Customers', path: '/customers', },
    { name: 'Messages', path: '/messages', },
    { name: 'Help', path: '/help', },
    { name: 'Settings', path: '/settings', },
    { name: 'Password', path: '/password', },
    { name: 'Subscription Plans', path: '/dashboard/subscription-plans' }, // menu mới
    { name: 'Sign Out', path: '/signout', }
  ];

  return (
    <aside
      className={`bg-[#2e1a7b] min-h-screen text-white transition-all duration-300
        ${isOpen ? 'w-64' : 'w-20 overflow-hidden'}`}
    >
      <div className={`px-8 py-6 flex items-center space-x-3 bg-[#4b3da7] transition-all duration-300`}>
        <span className={`text-[30px] font-semibold select-none ${isOpen ? 'block' : 'hidden'}`}>CueMatch</span>
      </div>

      <nav className="mt-8 flex flex-col space-y-1 px-4">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full text-left flex items-center space-x-4 px-5 py-3 rounded-lg text-base font-medium transition-colors duration-300 ${
                isActive
                  ? 'bg-[#1f1261] text-white shadow-lg'
                  : 'text-[#c0bde6] hover:bg-[#563ddb] hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {isOpen && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;