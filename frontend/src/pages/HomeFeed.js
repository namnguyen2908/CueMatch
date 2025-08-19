// src/pages/HomeFeed.jsx
import React, { useState, useRef } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import PostCard from "../components/PostCard";
import PostModal from "../components/PostModal/PostModal";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import "../components/animations.css";
import { useUser } from "../contexts/UserContext";
import PostList from "../components/PostList";

const HomeFeed = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const postCardRef = useRef();
  const { datauser } = useUser();

  const handleOpenPostModal = () => setIsPostModalOpen(true);
  const handleClosePostModal = () => setIsPostModalOpen(false);
  const handlePostCreated = () => {
    postCardRef.current?.reloadPosts();
  };

  return (
    <div className="relative min-h-screen text-gray-200 overflow-hidden">
      {/* Background hiệu ứng sao lấp lánh */}
      <AnimatedBackground />

      <Header />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pt-28 pl-72 pr-6 max-w-5xl mx-auto">
        {/* Composer card */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.995 }}
          className="bg-black/40 border border-yellow-500/20 backdrop-blur-xl rounded-2xl p-4 mb-6
                     shadow-[0_0_40px_-10px_rgba(255,215,0,.25)] hover:shadow-yellow-500/30
                     transition-all duration-500 cursor-pointer"
          onClick={handleOpenPostModal}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-yellow-400/60">
              <img src={datauser.avatar}/>
            </div>
            <div
              className="flex-1 bg-[#1e1e1f] text-gray-400 hover:text-gray-100
                         hover:bg-[#27272a] rounded-full px-4 py-2 transition-colors duration-300"
            >
              Share your achievements...
            </div>
          </div>
        </motion.div>

        <PostList />
      </main>

      <PostModal
        isOpen={isPostModalOpen}
        onClose={handleClosePostModal}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomeFeed;
