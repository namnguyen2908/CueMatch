import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import PostCard from "../../components/Post/PostCard";
import ModalEditProfile from "../../components/ModalEditProfile";
import userApi from "../../api/userApi";
import postApi from "../../api/postApi";
import PostList from "../../components/Post/PostList";
import PostModal from "../../components/PostModal/PostModal";
import PostDetailModal from "../../components/postDetail/PostDetailModal";
import logoImage from '../../assets/cover-profile.jpg';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const postListRef = useRef();
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  const handlePostClick = (post) => setSelectedPost(post);
  const handleCloseDetailModal = () => setSelectedPost(null);

  // Gọi API khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userApi.getUserDetail();
        setUser(userData);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#18191a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-[#e4e6ea] text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18191a]">
      <Header />
      <Sidebar />

      {/* Main Content */}
      <div className="pl-[15rem] min-h-screen">
        {/* Cover Photo Section */}
        <div className="bg-[#242526] border-b border-[#3a3b3c]">
          <div className="max-w-5xl mx-auto">
            {/* Cover Image */}
            <div className="relative">
              <div className="h-80 sm:h-[20rem] w-full overflow-hidden rounded-b-lg">
                <img
                  src={logoImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="px-4 sm:px-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                {/* Avatar and Name */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8 sm:-mt-[5.5rem]">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border-4 border-[#242526] overflow-hidden bg-[#3a3b3c] shadow-xl">
                      <img
                        src={user.Avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Name and Bio */}
                  <div className="sm:pb-4">
                    <h1 className="text-[#e4e6ea] text-3xl sm:text-4xl font-bold mb-2">
                      {user.Name}
                    </h1>
                    <div className="flex items-center gap-2 text-[#b0b3b8] text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>10 friends</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 sm:pb-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6ea] rounded-lg flex items-center gap-2 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#242526] border-b border-[#3a3b3c] sticky top-20 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <nav className="flex gap-8">
              {[
                { id: 'posts', label: 'Posts', icon: 'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-5 2v4h4V5h-4z' },
                { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#1877f2] text-[#1877f2]'
                      : 'border-transparent text-[#b0b3b8] hover:text-[#e4e6ea] hover:border-[#4e4f50]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={tab.icon} />
                  </svg>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto px-4 sm:px-2 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Info Cards */}
            <div className="lg:order-1 space-y-4">
              {/* Intro Card */}
              <div className="bg-[#242526] rounded-xl p-4 shadow-lg">
                <h3 className="text-[#e4e6ea] text-xl font-bold mb-4">Intro</h3>
                
                {user.Bio && (
                  <div className="mb-4">
                    <p className="text-[#b0b3b8] text-center">{user.Bio}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[#b0b3b8]">
                    <svg className="w-5 h-5 text-[#65676b]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>{user.Email}</span>
                  </div>

                  {user.DateOfBirth && (
                    <div className="flex items-center gap-3 text-[#b0b3b8]">
                      <svg className="w-5 h-5 text-[#65676b]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>Born {new Date(user.DateOfBirth).toLocaleDateString("en-US", { 
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[#b0b3b8]">
                    <svg className="w-5 h-5 text-[#65676b]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>Followed by 10 people</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full mt-4 py-2 bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6ea] rounded-lg font-medium transition-colors"
                >
                  Edit details
                </button>
              </div>

              {/* Stats Card */}
              <div className="bg-[#242526] rounded-xl p-4 shadow-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#e4e6ea]">10</p>
                    <p className="text-xs text-[#b0b3b8] uppercase">Posts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#e4e6ea]">0</p>
                    <p className="text-xs text-[#b0b3b8] uppercase">Friends</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#e4e6ea]">0</p>
                    <p className="text-xs text-[#b0b3b8] uppercase">Photos</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Main Content - Posts */}
            <div className="lg:col-span-2 lg:order-2 space-y-4">
              {activeTab === 'posts' && (
                <>
                  {/* Posts List */}
                  <PostList
                    isProfile
                    ref={postListRef}
                    onEdit={setEditingPost}
                    onDelete={() => postListRef.current?.reloadPosts()}
                    onPostClick={handlePostClick}
                  />
                </>
              )}

              {activeTab === 'about' && (
                <div className="bg-[#242526] rounded-xl p-6 shadow-lg">
                  <h2 className="text-[#e4e6ea] text-2xl font-bold mb-6">About</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[#e4e6ea] font-semibold mb-3">Contact Info</h3>
                      <div className="space-y-2 text-[#b0b3b8]">
                        <p>📧 {user.Email}</p>
                        {user.DateOfBirth && (
                          <p>🎂 Born {new Date(user.DateOfBirth).toLocaleDateString("en-US", { 
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}</p>
                        )}
                      </div>
                    </div>
                    
                    {user.Bio && (
                      <div>
                        <h3 className="text-[#e4e6ea] font-semibold mb-3">Bio</h3>
                        <p className="text-[#b0b3b8]">{user.Bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModalEditProfile
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={user}
        onSave={handleSave}
      />
      <PostModal
        isOpen={!!editingPost}
        editingPost={editingPost}
        onClose={() => setEditingPost(null)}
        onPostCreated={() => {
          postListRef.current?.reloadPosts();
          setEditingPost(null);
        }}
      />
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default Profile;