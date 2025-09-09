import React, { useEffect, useState } from "react";
import friendApi from "../../api/friendApi";
import { FaUserPlus, FaUsers, FaStar, FaRocket } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(null);
  const [error, setError] = useState(null);

  const fetchSuggestions = async () => {
    try {
      const res = await friendApi.suggestFriends();
      setSuggestions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải gợi ý");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSendRequest = async (userId) => {
    setSendingRequest(userId);
    try {
      await friendApi.sendFriendRequest(userId);
      // Xoá khỏi danh sách sau khi gửi
      setSuggestions((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể gửi lời mời");
    } finally {
      setSendingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-purple-400 text-xs font-bold">✨</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-red-400 text-lg font-semibold mb-2">Oops! Something went wrong</p>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={fetchSuggestions}
          className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="text-8xl mb-6">🎯</div>
        <h3 className="text-2xl font-bold text-white mb-2">No suggestions available</h3>
        <p className="text-gray-400">Check back later for new friend recommendations!</p>
        <p className="text-gray-500 text-sm mt-2">We're always working to find great matches for you</p>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-1">
            Friend Suggestions ({suggestions.length})
          </h2>
          <p className="text-gray-400">People you might know and want to connect with</p>
        </div>
      </div>

      {/* Suggestions Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {suggestions.map((user, index) => (
            <motion.div
              key={user._id}
              variants={cardVariants}
              layout
              exit={{
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.3 }
              }}
              whileHover={{
                transition: { type: "spring", stiffness: 300 }
              }}
              className="group relative"
            >
              <div className="relative bg-[#ECECEC] dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-2xl p-6 text-center shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                {/* Avatar Section */}
                <div className="relative mb-4 mt-2">
                  <div className="relative w-20 h-20 mx-auto">
                    <img
                      src={user.Avatar || "/default-avatar.png"}
                      alt={user.Name}
                      className="w-full h-full rounded-full object-cover border-3 border-orange-400/50 shadow-lg group-hover:border-orange-400 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 transition-colors">
                    {user.Name}
                  </h3>

                  {/* Mutual Friends Badge */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center gap-2">
                      <FaUsers className="text-blue-400 text-sm" />
                      <span className="text-blue-300 text-sm font-medium">
                        {user.mutualFriends || 0} mutual friends
                      </span>
                    </div>
                  </div>

                  {/* Recommendation Reason */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Suggested because:</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      <span className="px-2 py-1 bg-orange-500/20 text-black text-xs rounded-full">
                        Mutual friends
                      </span>
                      <span className="px-2 py-1 bg-green-500/20 text-black text-xs rounded-full">
                        Similar interests
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <motion.button
                    onClick={() => handleSendRequest(user._id)}
                    disabled={sendingRequest === user._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-400 to-yellow-300 hover:from-orange-300 hover:to-yellow-200 text-black font-semibold rounded-xl shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                  >
                    {sendingRequest === user._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FaRocket />
                        <span>Add friend</span>
                      </>
                    )}
                  </motion.button>
                </div>
                {/* Suggestion rank indicator */}
                {index < 5 && (
                  <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                )}
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-600/20 via-yellow-400/20 to-orange-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Suggestions;