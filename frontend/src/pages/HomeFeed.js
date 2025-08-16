// src/pages/HomeFeed.jsx
import React, { useState } from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal/PostModal';


const HomeFeed = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleOpenPostModal = () => setIsPostModalOpen(true);
  const handleClosePostModal = () => setIsPostModalOpen(false);


  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="pt-24 pl-72 pr-4 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={handleOpenPostModal}>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src={"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} alt="User" className="w-full h-full object-cover"/>
          </div>
          <div className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full px-4 py-2 transition-colors duration-200">
            Share your achievements...
          </div>
        </div>
      </div>
        <PostCard />
      </main>
      <PostModal 
        isOpen={isPostModalOpen} 
        onClose={handleClosePostModal} 
      />
    </div>
  );
};

export default HomeFeed;
