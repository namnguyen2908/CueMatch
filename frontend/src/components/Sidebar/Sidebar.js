// src/components/Sidebar.jsx
import React from 'react';
import { Home, UserPen , Users, Bookmark , UserRoundPlus, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', color: 'text-orange-600' },
    { id: 'profile', icon: UserPen , label: 'Profile', color: 'text-blue-600' },
    { id: 'friends', icon: UserRoundPlus, label: 'Friends', color: 'text-yellow-600' },
    { id: 'favourites', icon: Bookmark , label: 'Favourites', color: 'text-green-600' },
    { id: 'groups', icon: Users , label: 'Groups', color: 'text-green-600' },
    { id: 'settings', icon: Settings, label: 'Cài đặt', color: 'text-gray-600' }
  ];

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white shadow-xl z-40 overflow-y-auto">
      <div className="p-6">
        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-gray-50 ${
                  isActive ? 'bg-orange-50 border-r-4 border-orange-500 shadow-md' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-gray-600'}`} />
                <span className={`font-medium ${isActive ? 'text-orange-600' : 'text-gray-700'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Stats */}
      </div>
    </aside>
  );
};

export default Sidebar;
