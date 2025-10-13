// src/components/Header.js
import React from 'react';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle sidebar"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
            </div>
          </button>
        </div>

        {/* <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search here"
              className="w-full px-4 py-2 pl-10 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-blue-400 focus:bg-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <div className="w-4 h-4 border border-gray-400 rounded-full"></div>
            </div>
          </div>
        </div> */}

        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;