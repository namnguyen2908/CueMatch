// src/pages/HomeFeed.jsx
import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
// import PostCard from "../components/PostCard";
import PostModal from "../components/PostModal/PostModal";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import "../components/animations.css";
import { useUser } from "../contexts/UserContext";
import { useChat } from '../contexts/ChatContext';
import PostList from "../components/Post/PostList";
import PostDetailModal from "../components/postDetail/PostDetailModal";
import RightBar from "../components/Sidebar/RightBar";
import ChatBox from "../components/Chat/ChatBox";
import { createConversation } from '../api/messageApi'; // Import API

const HomeFeed = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const postCardRef = useRef();
  const { datauser } = useUser();
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const { openChatWith } = useChat();

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
    
    // ✅ Gọi hàm từ context để mở chat
    openChatWith(friend, conversation._id);

  } catch (err) {
    console.error("Lỗi khi tạo/lấy conversation:", err);
  }
};

  useEffect(() => {
    if (editingPost) {
      setIsPostModalOpen(true);
    }
  }, [editingPost]);

  return (
    <div className="relative min-h-screen text-gray-200 overflow-hidden">
      {/* Background hiệu ứng sao lấp lánh */}
      <AnimatedBackground />
      <Header />

      {/* Layout 3 cột bằng flex */}
      <div className="flex pt-28">
        {/* Sidebar bên trái */}
        <div className="w-[250px] fixed left-0 top-0 pt-28 z-10">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content ở giữa */}
        <div className="flex-1 mx-auto max-w-[700px] px-4">
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
                <img src={datauser.avatar} alt="User Avatar" />
              </div>
              <div
                className="flex-1 bg-[#1e1e1f] text-gray-400 hover:text-gray-100
                        hover:bg-[#27272a] rounded-full px-4 py-2 transition-colors duration-300"
              >
                Share your achievements...
              </div>
            </div>
          </motion.div>

          {/* Danh sách bài viết */}
          <PostList
            ref={postCardRef}
            onPostClick={handlePostClick}
            onEdit={setEditingPost}
          />
        </div>

        {/* RightBar bên phải */}
        <div className="w-[250px] fixed right-0 top-0 pt-28 z-10">
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
