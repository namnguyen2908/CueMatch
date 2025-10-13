import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FaChair, FaMoneyBillWave, FaCalendarCheck } from 'react-icons/fa';

const ClubDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const stats = [
    {
      title: "Bàn đang chơi",
      value: 5,
      description: "Số bàn hiện đang có khách",
      icon: <FaChair className="text-indigo-500 w-6 h-6" />,
      color: "text-indigo-600",
    },
    {
      title: "Doanh thu hôm nay",
      value: "3,500,000₫",
      description: "Tổng doanh thu ngày hôm nay",
      icon: <FaMoneyBillWave className="text-green-500 w-6 h-6" />,
      color: "text-green-600",
    },
    {
      title: "Lịch đặt bàn",
      value: 12,
      description: "Số lượng lịch đã đặt",
      icon: <FaCalendarCheck className="text-yellow-500 w-6 h-6" />,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className="flex flex-col flex-1 overflow-auto transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '16rem' : '4rem' }} // tương ứng w-64 hoặc w-16
      >

        <main className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {stat.icon}
                </div>
                <h3 className="text-lg font-semibold">{stat.title}</h3>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.description}</p>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default ClubDashboard;