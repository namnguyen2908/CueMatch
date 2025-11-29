import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: '📊' },
    { name: 'Users', path: '/dashboard/users', icon: '👥' },
    { name: 'Billiards Clubs', path: '/dashboard/billiards-management', icon: '🎱' },
    { name: 'Subscription Plans', path: '/dashboard/subscription-plans', icon: '💳' },
    { name: 'Withdrawals', path: '/dashboard/withdrawals', icon: '💸' },
  ];

  const handleClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (path) =>
    path ? location.pathname === path || location.pathname.startsWith(`${path}/`) : false;

  return (
    <aside
      className={`bg-gray-900 min-h-screen text-white transition-all duration-200 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="px-5 py-6 border-b border-gray-800">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">CueMatch</p>
        {isOpen && <p className="text-lg font-semibold text-white mt-1">Admin</p>}
      </div>

      <nav className="mt-4 flex flex-col space-y-1 px-3">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              className={`flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium border border-transparent ${
                active ? 'bg-gray-800 border-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-lg" aria-hidden="true">
                {item.icon}
              </span>
              {isOpen && <span className="ml-3">{item.name}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
