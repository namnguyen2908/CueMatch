import React, { useEffect, useState } from "react";
import friendApi from "../../api/friendApi";
import { FaUserTimes, FaPaperPlane, FaClock, FaEye } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const RequestSent = () => {
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [error, setError] = useState(null);
    console.log(sentRequests)
    const fetchSentRequests = async () => {
        try {
            const res = await friendApi.getSentRequests();
            setSentRequests(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi tải danh sách đã gửi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSentRequests();
    }, []);

    const handleCancel = async (toUserId) => {
        const confirm = window.confirm("Bạn có chắc muốn hủy lời mời?");
        if (!confirm) return;

        setCancellingId(toUserId);
        try {
            await friendApi.cancelFriendRequest(toUserId);
            setSentRequests((prev) => prev.filter((r) => r.To._id !== toUserId));
        } catch (err) {
            alert(err.response?.data?.message || "Không thể hủy lời mời");
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-500/30 rounded-full animate-spin"></div>
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-orange-400 text-xs font-bold">📤</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-red-400 text-lg font-semibold mb-2">Oops! Something went wrong</p>
                <p className="text-gray-400">{error}</p>
                <button
                    onClick={fetchSentRequests}
                    className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (sentRequests.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
            >
                <div className="text-8xl mb-6">📨</div>
                <h3 className="text-2xl font-bold text-white mb-2">No outgoing requests</h3>
                <p className="text-gray-400">You haven't sent any friend requests yet.</p>
                <p className="text-gray-500 text-sm mt-2">Go to Suggestions to find new friends!</p>
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
            x: 30,
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
                        Sent Requests ({sentRequests.length})
                    </h2>
                    <p className="text-gray-400">Pending friend requests you've sent</p>
                </div>
                <div className="text-3xl animate-pulse">⏳</div>
            </div>

            {/* Sent Requests List */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                <AnimatePresence>
                    {sentRequests.map((req) => (
                        <motion.div
                            key={req._id}
                            variants={itemVariants}
                            layout
                            exit={{
                                opacity: 0,
                                x: -100,
                                scale: 0.95,
                                transition: { duration: 0.3 }
                            }}
                            whileHover={{ scale: 1.02 }}
                            className="group relative"
                        >
                            <div className="relative bg-gradient-to-r from-white/8 to-white/4 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">

                                {/* Background Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Pending indicator line */}
                                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-orange-400 to-yellow-400 opacity-60" />

                                {/* Content */}
                                <div className="relative z-10 flex items-center justify-between">
                                    {/* User Info */}
                                    <div className="flex items-center gap-4">
                                        {/* Avatar with pending indicator */}
                                        <div className="relative">
                                            <img
                                                src={req.To.Avatar || "/default-avatar.png"}
                                                alt={req.To.Name}
                                                className="w-16 h-16 rounded-full object-cover border-3 border-orange-400/50 shadow-lg group-hover:border-orange-400 transition-all duration-300"
                                            />

                                            {/* Pending status */}
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full border-2 border-white/20 flex items-center justify-center">
                                                <FaClock className="text-white text-xs animate-pulse" />
                                            </div>
                                        </div>

                                        {/* User Details */}
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-300 transition-colors">
                                                {req.To.Name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <FaPaperPlane className="text-orange-400" />
                                                <span>Request sent • Waiting for response</span>
                                            </div>

                                            {/* Status badges */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30">
                                                    Pending
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <FaEye />
                                                    <span>Not viewed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cancel Button */}
                                    <div className="flex flex-col items-end gap-2">
                                        <motion.button
                                            onClick={() => handleCancel(req.To._id)}
                                            disabled={cancellingId === req.To._id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="relative px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                                        >
                                            {cancellingId === req.To._id ? (
                                                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                            ) : (
                                                <FaUserTimes />
                                            )}
                                            <span>Cancel</span>
                                        </motion.button>

                                        {/* Time info */}
                                        <span className="text-xs text-gray-500">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Animated pulse for pending state */}
                                <div className="absolute inset-0 border-2 border-orange-400/20 rounded-2xl animate-pulse" />

                                {/* Floating icon */}
                                <div className="absolute top-4 right-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="text-orange-400 animate-bounce delay-200">🚀</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default RequestSent;