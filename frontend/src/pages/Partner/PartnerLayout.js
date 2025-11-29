import React, { useState } from 'react';
import Sidebar from './Sidebar';
import PartnerHeader from '../../components/PartnerHeader/PartnerHeader';

const PartnerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '16rem' : '4rem' }}
      >
        <PartnerHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PartnerLayout;

