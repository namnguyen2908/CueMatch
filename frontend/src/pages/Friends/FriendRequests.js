import React, { useEffect, useState } from "react";
import friendApi from "../../api/friendApi";
import { FaUserCheck, FaUserTimes, FaClock, FaHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await friendApi.getReceivedRequests();
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải lời mời");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (fromUserId) => {
    setProcessingId(fromUserId);
    try {
      await friendApi.acceptFriendRequest(fromUserId);
      setRequests((prev) => prev.filter((r) => r.From._id !== fromUserId));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể chấp nhận lời mời");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (fromUserId) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn từ chối lời mời?");
    if (!confirm) return;

    setProcessingId(fromUserId);
    try {
      await friendApi.rejectFriendRequest(fromUserId);
      setRequests((prev) => prev.filter((r) => r.From._id !== fromUserId));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể từ chối lời mời");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-400 text-xs font-bold">📩</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😞</div>
        <p className="text-red-400 text-lg font-semibold mb-2">Oops! Something went wrong</p>
        <p className="text-gray-400">{error}</p>
        <button 
          onClick={fetchRequests}
          className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="text-8xl mb-6">📬</div>
        <h3 className="text-2xl font-bold text-white mb-2">All caught up!</h3>
        <p className="text-gray-400">No new friend requests at the moment.</p>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Friend Requests ({requests.length})
          </h2>
          <p className="text-gray-400">People who want to be your friend</p>
        </div>
        <div className="text-3xl animate-bounce">💝</div>
      </div>

      {/* Requests List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence>
          {requests.map((req) => (
            <motion.div
              key={req._id}
              variants={itemVariants}
              layout
              exit={{ 
                opacity: 0, 
                x: 100, 
                scale: 0.95,
                transition: { duration: 0.3 }
              }}
              whileHover={{ scale: 1.02 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar with notification pulse */}
                    <div className="relative">
                      <img
                        src={req.From.Avatar || "/default-avatar.png"}
                        alt={req.From.Name}
                        className="w-16 h-16 rounded-full object-cover border-3 border-blue-400/50 shadow-lg group-hover:border-blue-400 transition-all duration-300"
                      />
                      
                      {/* Notification dot */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white/20 flex items-center justify-center animate-pulse">
                        <FaHeart className="text-white text-xs" />
                      </div>
                    </div>

                    {/* User Details */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                        {req.From.Name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FaClock className="text-blue-400" />
                        <span>Wants to be your friend</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => handleAccept(req.From._id)}
                      disabled={processingId === req.From._id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                      {processingId === req.From._id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FaUserCheck />
                      )}
                      <span>Accept</span>
                    </motion.button>

                    <motion.button
                      onClick={() => handleReject(req.From._id)}
                      disabled={processingId === req.From._id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative px-6 py-3 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/30 text-gray-300 hover:text-red-300 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                      {processingId === req.From._id ? (
                        <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                      ) : (
                        <FaUserTimes />
                      )}
                      <span>Decline</span>
                    </motion.button>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Floating icons */}
                <div className="absolute top-4 right-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-blue-400 animate-bounce delay-100">💫</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default FriendRequests;