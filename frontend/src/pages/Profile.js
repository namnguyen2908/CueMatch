import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import PostCard from "../components/Post/PostCard";
import ModalEditProfile from "../components/ModalEditProfile";
import userApi from "../api/userApi";
import postApi from "../api/postApi";
import PostList from "../components/Post/PostList";
import PostModal from "../components/PostModal/PostModal";
import PostDetailModal from "../components/postDetail/PostDetailModal";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // để sửa bài viết
  const postListRef = useRef(); // để reload lại bài viết sau khi sửa/xóa
  const [selectedPost, setSelectedPost] = useState(null);

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

  if (!user) return <div className="text-center pt-20 text-white">Đang tải dữ liệu...</div>;

  return (
    <div className="relative min-h-screen bg-[#0b0b0b] text-gray-100 overflow-hidden">
      <Header />
      <Sidebar />

      <main className="pl-72 pr-6 pt-32 max-w-7xl mx-auto">
        {/* Cover + Avatar */}
        <div className="relative mb-28">
          <div className="h-64 w-full rounded-3xl overflow-hidden border border-yellow-500/20 shadow-[0_0_80px_-20px_rgba(255,215,0,0.4)]">
            <img
              src={user.Cover || "https://images.unsplash.com/photo-1580844641954-f10cd3d1d8dc?w=1600"}
              alt="Cover"
              className="w-full h-full object-cover brightness-[0.6]"
            />
          </div>

          <div className="absolute left-1/2 -bottom-20 transform -translate-x-1/2 flex flex-col items-center text-center">
            <div className="w-40 h-40 rounded-full border-4 border-yellow-400 overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.5)] bg-[#111]">
              <img
                src={user.Avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-yellow-300 drop-shadow-sm">
              {user.Name}
            </h2>
            <p className="text-gray-400 mt-1 max-w-md">
              {user.Bio || "🏆 No bio yet"}
            </p>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Bài viết */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-yellow-200">10</p>
                <p className="text-sm uppercase text-gray-400">Posts</p>
              </div>
              {/* Bạn có thể thêm Followers/Follows ở đây nếu backend có */}
            </div>

            <div className="flex justify-around text-gray-300 text-lg font-semibold border-b border-yellow-500/20 mb-6">
              <button className="hover:text-yellow-400 transition">Posts</button>
              <button className="hover:text-yellow-400 transition">Achievements</button>
              <button className="hover:text-yellow-400 transition">Highlights</button>
            </div>

            <PostList
              isProfile
              ref={postListRef}
              onEdit={setEditingPost}
              onDelete={() => postListRef.current?.reloadPosts()}
              onPostClick={handlePostClick}
            />
          </div>

          {/* Thông tin phụ */}
          <aside className="space-y-6">
            <div className="bg-[#111]/70 border border-yellow-500/20 rounded-2xl p-4 shadow hover:shadow-yellow-500/10 transition-all">
              <h3 className="text-yellow-300 font-semibold mb-2">Email</h3>
              <p className="text-gray-300 text-sm">{user.Email}</p>
            </div>

            {user.DateOfBirth && (
              <div className="bg-[#111]/70 border border-yellow-500/20 rounded-2xl p-4 shadow hover:shadow-yellow-500/10 transition-all">
                <h3 className="text-yellow-300 font-semibold mb-2">Date of Birth</h3>
                <p className="text-gray-300 text-sm">
                  {new Date(user.DateOfBirth).toLocaleDateString("vi-VN")}
                </p>
              </div>
            )}

            <div className="text-right">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-yellow-400/10 border border-yellow-300/40 rounded-full text-yellow-200 hover:bg-yellow-500/20 transition-all shadow hover:shadow-yellow-300/40"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </aside>
        </div>
      </main>

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
