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
      console.error("Lỗi khi tạo/lấy conversation:", err);
    }
  };

  useEffect(() => {
    if (editingPost) {
      setIsPostModalOpen(true);
    }
  }, [editingPost]);

  return (
    <div className="relative min-h-screen overflow-hidden
      bg-[#F2F4F7] dark:bg-[#242424] 
      text-gray-900 dark:text-gray-200
      transition-colors duration-300"
    >
      <Header />

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
            className="
    bg-[#EEEEEE] dark:bg-black/40 
    border-[2px] dark:border-yellow-500/20 
    backdrop-blur-xl rounded-2xl p-4 mb-6
    shadow-[0_0_30px_-10px_rgba(0,0,0,0.3)] 
    hover:shadow-yellow-400/40 dark:hover:shadow-yellow-500/30
    transition-all duration-500 cursor-pointer
  "
            onClick={handleOpenPostModal}
          >
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-yellow-400/60">
                <img src={datauser.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
              <div
                className="
        flex-1 
        bg-[#E4E6E8] dark:bg-[#1e1e1f]
        text-gray-700 dark:text-gray-400 
        hover:text-gray-900 dark:hover:text-gray-100
        hover:bg-[#DEDEDE] dark:hover:bg-[#27272a]
        rounded-full px-4 py-2 transition-colors duration-300 cursor-text
      "
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