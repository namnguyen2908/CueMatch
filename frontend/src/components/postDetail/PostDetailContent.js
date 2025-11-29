import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Share, Calendar } from "lucide-react";
import Reaction from "../Reaction";
import postApi from "../../api/postApi";
import reactionApi from "../../api/reactionApi";
import ReactionModal from "../ReactionModal";

const PostDetailContent = ({ post }) => {
  const { UserID, Content, createdAt, ReactionCounts, CommentCount } = post;
  const [localPost, setLocalPost] = useState(post);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [groupedReactions, setGroupedReactions] = useState({});

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const handleReacted = async () => {
    try {
      const updatedPost = await postApi.getPostById(localPost._id);
      setLocalPost(updatedPost);
    } catch (error) {
      console.error("Error updating post after reaction:", error);
    }
  };

  const handleOpenReactions = async () => {
    try {
      const reactions = await reactionApi.getReactionsGroupedByType(localPost._id);
      setGroupedReactions(reactions);
      setShowReactionModal(true);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const getTopReactions = (reactionCounts, top = 2) => {
    if (!reactionCounts) return [];
    return Object.entries(reactionCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, top)
      .map(([type]) => type);
  };

  const reactionIconsMap = {
    like: { emoji: "👍", color: "#0055ff" },
    love: { emoji: "❤️", color: "#ff0b0b" },
    haha: { emoji: "😂", color: "#ffd062" },
    wow: { emoji: "😮", color: "#ffff2d" },
    sad: { emoji: "😢", color: "#ffc95c" },
    angry: { emoji: "😠", color: "#ff9d2d" },
  };

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="flex items-center gap-4">
        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <img
            src={UserID?.Avatar || "https://via.placeholder.com/80"}
            className="w-14 h-14 rounded-2xl border-2 border-sport-300/60 dark:border-sport-600/60 object-cover shadow-md ring-2 ring-sport-200/50 dark:ring-sport-800/50"
            alt=""
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-luxury-800 shadow-lg"></div>
        </motion.div>

        <div className="flex-1">
          <p className="font-bold text-lg text-luxury-900 dark:text-luxury-100 font-display">
            {UserID?.Name || "Anonymous"}
          </p>

          <div className="flex items-center gap-2 text-sm text-luxury-600 dark:text-luxury-400 mt-1">
            <Calendar className="w-4 h-4 text-sport-500" />
            <span>
              {new Date(createdAt).toLocaleString("en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      {Content && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-luxury-800 dark:text-luxury-200 leading-relaxed whitespace-pre-line text-base"
        >
          {Content}
        </motion.div>
      )}

      {/* Reaction Summary */}
      <div className="flex items-center justify-between py-4 border-t border-sport-200/30 dark:border-sport-800/30">
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={handleOpenReactions}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="flex -space-x-2">
            {getTopReactions(localPost.ReactionCounts).map((type, idx) => {
              const r = reactionIconsMap[type];
              return (
                <div
                  key={type}
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-luxury-800 shadow-sm text-lg"
                  style={{
                    backgroundColor: r.color + "20",
                    zIndex: getTopReactions(localPost.ReactionCounts).length - idx,
                    marginLeft: idx !== 0 ? "-8px" : "0",
                  }}
                >
                  {r.emoji}
                </div>
              );
            })}
          </div>

          <span className="text-sm font-semibold text-luxury-700 dark:text-luxury-300 group-hover:text-sport-600 dark:group-hover:text-sport-400 transition-colors">
            {Object.values(localPost.ReactionCounts || {}).reduce((a, b) => a + b, 0)}
          </span>
        </motion.div>

        <div className="flex items-center gap-4 text-sm text-luxury-600 dark:text-luxury-400">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-sport-500" />
            <span className="font-medium">{localPost.CommentCount || 0} Comments</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-around border-t border-sport-200/30 dark:border-sport-800/30 pt-4">
        <div className="flex-1">
          <Reaction post={localPost} onReacted={handleReacted} />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl 
            text-luxury-600 dark:text-luxury-400 
            hover:text-blue-500 dark:hover:text-blue-400 
            hover:bg-blue-50/50 dark:hover:bg-blue-500/10 
            transition-all duration-200 font-medium text-sm"
        >
          <MessageSquare className="w-5 h-5" />
          Comment
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl 
            text-luxury-600 dark:text-luxury-400 
            hover:text-green-500 dark:hover:text-green-400 
            hover:bg-green-50/50 dark:hover:bg-green-500/10 
            transition-all duration-200 font-medium text-sm"
        >
          <Share className="w-5 h-5" />
          Share
        </motion.button>
      </div>

      {/* Reaction Modal */}
      {showReactionModal && (
        <ReactionModal
          groupedReactions={groupedReactions}
          onClose={() => setShowReactionModal(false)}
        />
      )}
    </div>
  );
};

export default PostDetailContent;