import React, { useEffect, useState } from "react";
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import savedApi from "../api/savedApi";
import PostCard from "../components/Post/PostCard";
import PostDetailModal from "../components/postDetail/PostDetailModal";
import { Bookmark } from "lucide-react";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchSavedPosts = async () => {
    try {
      const res = await savedApi.getSavedPosts();
      // Convert savedPosts to simple post format
      const posts = (res.savedPosts || []).map(item => item.PostID).filter(Boolean);
      setSavedPosts(posts);
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseDetailModal = () => {
    setSelectedPost(null);
  };

  const handleUnsave = async (postId) => {
    try {
      await savedApi.unsavePost(postId);
      // Update the list after unsaving
      fetchSavedPosts();
    } catch (error) {
      console.error("Failed to unsave post:", error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden
      bg-gradient-to-br from-sport-50/30 via-white to-sport-100/20
      dark:from-luxury-950 dark:via-luxury-900 dark:to-luxury-800
      text-luxury-900 dark:text-luxury-100
      transition-colors duration-300
      pattern-sport dark:pattern-luxury">
      {/* Animated background mesh */}
      <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-50"></div>
      
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        variant="overlay"
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="pt-24 md:pt-28 relative z-10 flex flex-col lg:flex-row min-h-screen">
        <div className="hidden lg:block w-[250px] flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-sport shadow-sport">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-luxury-900 dark:text-luxury-100">
                Saved Posts
              </h1>
            </div>
            <p className="text-luxury-600 dark:text-luxury-400 text-sm">
              {savedPosts.length} {savedPosts.length === 1 ? 'post' : 'posts'} saved
            </p>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport-500"></div>
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-luxury-800/50 rounded-3xl border border-sport-200/50 dark:border-sport-800/50">
              <div className="w-20 h-20 bg-sport-100 dark:bg-sport-900/30 rounded-full flex items-center justify-center mb-4">
                <Bookmark className="w-10 h-10 text-sport-500 dark:text-sport-400" />
              </div>
              <p className="text-luxury-700 dark:text-luxury-300 font-medium text-lg mb-2">
                No posts saved yet
              </p>
              <p className="text-sm text-luxury-500 dark:text-luxury-500">
                Save your favorite posts to view them later!
              </p>
            </div>
          ) : (
            <PostCard
              posts={savedPosts}
              onPostClick={handlePostClick}
              onDelete={handleUnsave}
            />
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default SavedPosts;