import React, { useEffect, useState } from "react";
import friendApi from "../../api/friendApi";
import { FaUserTimes, FaSearch, FaFilter, FaUserCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AllFriend = () => {
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchFriends = async () => {
    try {
      const res = await friendApi.getFriends();
      setFriends(res.data);
      setFilteredFriends(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = friends.filter(friend =>
      friend.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFriends(filtered);
  }, [searchTerm, friends]);

  const handleUnfriend = async (friendId) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn hủy kết bạn?");
    if (!confirm) return;

    try {
      await friendApi.unfriend(friendId);
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể hủy kết bạn");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-purple-400 text-xs font-bold">👥</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-red-400 text-lg font-semibold mb-2">Oops! Something went wrong</p>
        <p className="text-gray-400">{error}</p>
        <button 
          onClick={fetchFriends}
          className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Your Friends ({filteredFriends.length})
          </h2>
          <p className="text-gray-400">Stay connected with your circle</p>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 lg:w-80">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <FaFilter className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredFriends.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="text-8xl mb-6">🫂</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {searchTerm ? "No friends found" : "No friends yet"}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm 
              ? `No friends match "${searchTerm}"` 
              : "Start building your network by adding some friends!"
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          )}
        </motion.div>
      )}

      {/* Friends Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence>
          {filteredFriends.map((friend) => (
            <motion.div
              key={friend._id}
              variants={cardVariants}
              layout
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              whileHover={{ 
                y: -8,
                transition: { type: "spring", stiffness: 300 }
              }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Unfriend Button */}
                <button
                  onClick={() => handleUnfriend(friend._id)}
                  className="absolute top-4 right-4 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/20 hover:text-red-300 rounded-lg z-10"
                  title="Hủy kết bạn"
                >
                  <FaUserTimes size={16} />
                </button>

                {/* Avatar Section */}
                <div className="relative mb-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <img
                      src={friend.Avatar || "/default-avatar.png"}
                      alt={friend.Name}
                      className="w-full h-full rounded-full object-cover border-3 border-purple-400/50 shadow-lg group-hover:border-purple-400 transition-all duration-300"
                    />
                    
                    {/* Online Status */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-3 border-white/20 rounded-full shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Floating Icons */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute -top-2 -left-2 text-yellow-400 animate-bounce delay-100">✨</div>
                    <div className="absolute -top-2 -right-2 text-blue-400 animate-bounce delay-200">💫</div>
                  </div>
                </div>

                {/* Friend Info */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    {friend.Name}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
                    <FaUserCheck className="text-green-400" />
                    <span>Bạn bè từ 2023</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button className="flex-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm rounded-lg transition-colors">
                      Message
                    </button>
                    <button className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm rounded-lg transition-colors">
                      Profile
                    </button>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AllFriend;