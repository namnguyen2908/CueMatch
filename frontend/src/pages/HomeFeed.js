import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import PostModal from "../components/PostModal/PostModal";
import { motion } from "framer-motion";
import { useUser } from "../contexts/UserContext";
import { useChat } from '../contexts/ChatContext';
import PostList from "../components/Post/PostList";
import PostDetailModal from "../components/postDetail/PostDetailModal";
import RightBar from "../components/Sidebar/RightBar";
import { createConversation } from '../api/messageApi';

const HomeFeed = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const postCardRef = useRef();
  const { datauser } = useUser();
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const { openChatWith } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handlePostClick = (post) => setSelectedPost(post);
  const handleCloseDetailModal = () => setSelectedPost(null);

  const handleOpenPostModal = () => setIsPostModalOpen(true);
  const handleClosePostModal = () => setIsPostModalOpen(false);
  const handlePostCreated = () => {
    postCardRef.current?.reloadPosts();
  };

  const handleFriendClick = async (friend) => {
    try {
      const res = await createConversation({
        MemberIds: [friend._id],
        Type: 'single',
      });

      const conversation = res.data;
      openChatWith(friend, conversation._id);

    } catch (err) {
      console.error("Error creating/fetching conversation:", err);
    }
  };

  useEffect(() => {
    if (editingPost) {
      setIsPostModalOpen(true);
    }
  }, [editingPost]);

  return (
    <div className="relative min-h-screen overflow-hidden
      bg-gradient-to-br from-sport-50/30 via-white to-sport-100/20
      dark:from-luxury-950 dark:via-luxury-900 dark:to-luxury-800
      text-luxury-900 dark:text-luxury-100
      transition-colors duration-300
      pattern-sport dark:pattern-luxury"
    >
      {/* Animated background mesh */}
      <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-50"></div>
      
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        variant="overlay"
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-col lg:flex-row pt-20 relative z-10">
        {/* Sidebar bên trái */}
        <div className="hidden lg:block w-[250px] flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content ở giữa */}
        <div className="flex-1 mx-auto w-full max-w-[700px] px-4 pt-6">
          {/* Composer card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              sport-card
              p-5 mb-6
              cursor-pointer
              group
              relative overflow-hidden
            "
            onClick={handleOpenPostModal}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-sport-50/0 to-sport-100/0 group-hover:from-sport-50/50 group-hover:to-sport-100/30 dark:group-hover:from-sport-900/20 dark:group-hover:to-sport-800/10 transition-all duration-300"></div>
            
            <div className="flex items-center space-x-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-sport-300 dark:border-sport-700 group-hover:border-sport-400 dark:group-hover:border-sport-600 transition-all duration-300 ring-2 ring-transparent group-hover:ring-sport-200/50 dark:group-hover:ring-sport-800/50">
                  <img src={datauser.avatar} alt="User Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-luxury-800"></div>
              </div>
              <div
                className="
                  flex-1 
                  bg-luxury-50 dark:bg-luxury-900/50
                  text-luxury-500 dark:text-luxury-400 
                  group-hover:text-luxury-700 dark:group-hover:text-luxury-200
                  group-hover:bg-luxury-100 dark:group-hover:bg-luxury-800/50
                  rounded-xl px-4 py-3 transition-all duration-300 cursor-text
                  border border-luxury-200/50 dark:border-luxury-700/50
                  group-hover:border-sport-300/50 dark:group-hover:border-sport-700/50
                "
              >
                <span className="text-sm font-medium">Share your achievements...</span>
              </div>
            </div>
          </motion.div>


          {/* Posts list */}
          <PostList
            ref={postCardRef}
            onPostClick={handlePostClick}
            onEdit={setEditingPost}
          />
        </div>

        {/* RightBar bên phải */}
        <div className="hidden xl:block w-[250px] flex-shrink-0">
          <RightBar onFriendClick={handleFriendClick} />
        </div>
      </div>

      {/* Modals */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingPost(null);
        }}
        onPostCreated={handlePostCreated}
        editingPost={editingPost}
      />

      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default HomeFeed;