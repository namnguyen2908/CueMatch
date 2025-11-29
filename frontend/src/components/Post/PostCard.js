// src/components/PostCard.jsx
import React, { memo, useState, useRef, useEffect } from "react";
import { Heart, MessageSquare, Share, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import SmartVideo from "../SmartVideo";
import postApi from "../../api/postApi";
import reactionApi from "../../api/reactionApi";
import ReactionModal from "../ReactionModal";
import savedApi from "../../api/savedApi";
import { useUser } from "../../contexts/UserContext";
import Reaction, { REACTION_MAP } from "../Reaction";
// Skeleton Loader
const Skeleton = () => (
  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
    <div className="flex items-center gap-4 mb-5">
      <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
    <div className="space-y-2 mb-5">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/6" />
    </div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
    <div className="flex justify-between items-center py-3 border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
    <div className="flex justify-around pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  </div>
);

const reactionIconsMap = Object.entries(REACTION_MAP).reduce((acc, [type, config]) => {
  acc[type] = {
    emoji: config.emoji,
    color: config.color,
  };
  return acc;
}, {});

const getTopReactions = (reactionCounts, top = 2) => {
  if (!reactionCounts) return [];
  return Object.entries(reactionCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([type]) => type);
};

// Action Button
const Action = ({ icon: Icon, label, hoverColor, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 hover:${hoverColor} transition-all`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

// Card component
const Card = memo(({ post, isLast, lastRef, onClick, onEdit, onDelete }) => {
  const { UserID, createdAt, Comments } = post;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { datauser } = useUser();
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [groupedReactions, setGroupedReactions] = useState({});
  // Quản lý state local cho post để cập nhật UI khi có thay đổi reaction
  const [localPost, setLocalPost] = useState(post);
  const [isSaved, setIsSaved] = useState(false);
  // Update localPost nếu prop post thay đổi
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const res = await savedApi.isPostSaved(localPost._id);
        setIsSaved(res.isSaved);
      } catch (err) {
        console.error("Check saved failed", err);
      }
    };

    checkSaved();
  }, [localPost._id]);

  const handleOpenReactions = async () => {
    try {
      const reactions = await reactionApi.getReactionsGroupedByType(localPost._id);
      setGroupedReactions(reactions);
      setShowReactionModal(true);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };


  // Hàm gọi API lấy post mới nhất để cập nhật UI khi reaction thay đổi
  const handleReacted = async () => {
    try {
      const updatedPost = await postApi.getPostById(localPost._id);
      setLocalPost(updatedPost);
    } catch (error) {
      console.error("Error updating post after reaction:", error);
    }
  };

  return (
    <motion.div
      ref={isLast ? lastRef : null}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="
        max-w-2xl mx-auto w-full mb-6 
        sport-card
        rounded-3xl p-6
        transition-all duration-300
        group
        relative overflow-hidden
      "
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sport-50/0 to-transparent pointer-events-none"></div>
      <div className="absolute top-4 right-4 z-50" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="text-luxury-400 transition-colors p-2 rounded-full glass-card relative z-50 cursor-pointer"
        >
          <MoreVertical className="w-5 h-5 pointer-events-none" />
        </button>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-40 glass-card rounded-xl z-20 overflow-hidden border border-sport-200/30 dark:border-sport-800/30"
          >
            {datauser?.id === UserID?._id ? (
              <>
              <button
                onClick={() => {
                  onEdit?.(localPost);
                  setShowMenu(false);
                }}
                className="block w-full px-4 py-3 text-left text-sm text-luxury-700 dark:text-luxury-300 transition-colors group"
              >
                <span className="transition-colors">✏️ Edit</span>
              </button>
                <button
                  onClick={async () => {
                    setShowMenu(false);
                    const confirm = window.confirm(
                      "Are you sure you want to delete this post?"
                    );
                    if (!confirm) return;

                    try {
                      await postApi.deletePost(localPost._id);
                      onDelete?.(localPost._id);
                    } catch (err) {
                      console.error("Delete failed:", err);
                      alert("Failed to delete post");
                    }
                  }}
                  className="block w-full px-4 py-3 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={async () => {
                  try {
                    if (isSaved) {
                      await savedApi.unsavePost(localPost._id);
                      setIsSaved(false);
                    } else {
                      await savedApi.savePost(localPost._id);
                      setIsSaved(true);
                    }
                  } catch (error) {
                    console.error("Save/Unsave failed", error);
                  } finally {
                    setShowMenu(false);
                  }
                }}
                className="block w-full px-4 py-3 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
              >
                {isSaved ? "Unsave" : "Save"}
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-5 relative z-10">
        <div className="relative">
          <img
            src={UserID?.Avatar || "https://via.placeholder.com/80"}
            alt="User Avatar"
            className="w-14 h-14 rounded-full border-2 border-sport-300/60 dark:border-sport-600/60 object-cover transition-all duration-300"
          />
        </div>
        <div className="flex-1">
          <p className="font-bold text-luxury-900 dark:text-luxury-100 text-base font-display">
            {UserID?.Name || "Ẩn danh"}
          </p>
          <p className="text-xs text-luxury-500 dark:text-luxury-400 mt-0.5">
            {new Date(localPost.createdAt).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      {localPost.Content && (
        <p className="text-luxury-800 dark:text-luxury-200 mb-5 leading-relaxed whitespace-pre-line text-[15px] relative z-10">
          {localPost.Content}
        </p>
      )}

      {/* Media */}
      {(localPost.Image?.length > 0 || localPost.Video?.length > 0) && (
        <div
          onClick={() => onClick?.(localPost)}
          className={`flex ${localPost.Image?.length > 0 && localPost.Video?.length > 0
            ? "flex-col md:flex-row gap-4"
            : ""
            } mb-4`}
        >
          {localPost.Image?.length > 0 && (
            <div
              className={`relative group overflow-hidden rounded-2xl max-h-[450px] mb-2 md:mb-0 ${localPost.Video?.length > 0 ? "w-full md:w-1/2" : "w-full"
                }`}
            >
              <img
                src={localPost.Image[0]}
                alt="Photo"
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-500"
              />
              {localPost.Image.length > 1 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center text-white text-xl font-bold">
                  <span className="bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                    +{localPost.Image.length - 1} more
                  </span>
                </div>
              )}
            </div>
          )}

          {localPost.Video?.length > 0 && (
            <div
              className={`relative group overflow-hidden rounded-2xl max-h-[450px] ${localPost.Image?.length > 0 ? "w-full md:w-1/2" : "w-full"
                }`}
            >
              <SmartVideo src={localPost.Video[0]} />
              {localPost.Video.length > 1 && (
                <div className="absolute bottom-0 right-0 bg-black/60 backdrop-blur-sm px-3 py-1.5 text-white text-sm font-semibold rounded-tl-2xl">
                  +{localPost.Video.length - 1} more
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {/* Reaction Summary */}
      <div className="flex justify-between items-center px-2 py-3 mb-2 text-sm relative z-10">
        <div
          className="flex items-center cursor-pointer"
          onClick={handleOpenReactions}
        >
          <div className="flex -space-x-2">
            {getTopReactions(localPost.ReactionCounts).map((type, idx) => {
              const r = reactionIconsMap[type];
              return (
                <div
                  key={type}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/70 dark:border-luxury-800/70 bg-white/80 dark:bg-black/30"
                  style={{
                    zIndex: getTopReactions(localPost.ReactionCounts).length - idx,
                    marginLeft: idx !== 0 ? "-8px" : "0",
                  }}
                >
                  <span className="text-base" style={{ color: r.color }}>
                    {r.emoji}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="ml-3 text-sm font-medium text-luxury-700 dark:text-luxury-300 group-hover/reaction:text-sport-500 dark:group-hover/reaction:text-sport-400 transition-colors">
            {Object.values(localPost.ReactionCounts || {}).reduce((a, b) => a + b, 0)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-luxury-600 dark:text-luxury-400">
          <span className="hover:text-luxury-800 dark:hover:text-luxury-200 transition-colors cursor-pointer font-medium">
            {localPost.CommentCount || 0} Comments
          </span>
          <span className="hover:text-luxury-800 dark:hover:text-luxury-200 transition-colors cursor-pointer font-medium">
            {localPost.ShareCount || 0} Shares
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-around border-t border-luxury-200/50 dark:border-luxury-700/50 pt-3 mt-3 relative z-10">
        {/* ✅ Tích hợp Reaction component */}
        <div className="flex-1">
          <Reaction
            post={localPost}
            onReacted={handleReacted}
          />
        </div>

        <button
          onClick={() => onClick?.(localPost)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-luxury-600 dark:text-luxury-400 font-medium text-sm"
        >
          <MessageSquare className="w-5 h-5" /> Comment
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-luxury-600 dark:text-luxury-400 font-medium text-sm">
          <Share className="w-5 h-5" /> Share
        </button>
      </div>
      {showReactionModal && (
        <ReactionModal
          groupedReactions={groupedReactions}
          onClose={() => setShowReactionModal(false)}
        />
      )}

    </motion.div>
  );
});

// Main PostCard component
const PostCard = ({ posts = [], onPostClick, lastRef, onEdit, onDelete }) => {
  return (
    <div>
      {posts.length === 0 ? (
        <>
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        posts.map((post, idx) => (
          <Card
            key={post._id}
            post={post}
            isLast={idx === posts.length - 1}
            lastRef={idx === posts.length - 1 ? lastRef : null}
            onClick={onPostClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};

export default memo(PostCard);