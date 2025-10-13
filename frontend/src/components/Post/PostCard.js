// src/components/PostCard.jsx
import React, { memo, useState, useRef, useEffect } from "react";
import { Heart, MessageSquare, Share, MoreVertical } from "lucide-react";
import SmartVideo from "../SmartVideo";
import postApi from "../../api/postApi";
import reactionApi from "../../api/reactionApi";
import ReactionModal from "../ReactionModal";
import savedApi from "../../api/savedApi";
import { useUser } from "../../contexts/UserContext";
import Reaction from "../Reaction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faHeart,
  faFaceGrinSquintTears,
  faFaceSurprise,
  faFaceSadCry,
  faFaceTired,
} from "@fortawesome/free-solid-svg-icons";
// Skeleton Loader
const Skeleton = () => (
  <div className="bg-black/40 border border-yellow-500/20 backdrop-blur-xl rounded-2xl p-6 mb-6 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-[#2a2a2a]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-[#2a2a2a] rounded" />
        <div className="h-3 w-28 bg-[#2a2a2a] rounded" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-[#2a2a2a] rounded w-full" />
      <div className="h-4 bg-[#2a2a2a] rounded w-5/6" />
    </div>
    <div className="h-48 bg-[#2a2a2a] rounded-xl" />
  </div>
);

const reactionIconsMap = {
  like: { icon: faThumbsUp, color: "#0055ff", bg: "rgba(161, 166, 167, 0.91)" },
  love: { icon: faHeart, color: "#ff0b0b", bg: "rgba(161, 166, 167, 0.91)" },
  haha: { icon: faFaceGrinSquintTears, color: "#ffd062", bg: "rgba(161, 166, 167, 0.91)" },
  wow: { icon: faFaceSurprise, color: "#ffff2d", bg: "rgba(161, 166, 167, 0.91)" },
  sad: { icon: faFaceSadCry, color: "#ffc95c", bg: "rgba(161, 166, 167, 0.91)" },
  angry: { icon: faFaceTired, color: "#ff9d2d", bg: "rgba(161, 166, 167, 0.91)" },
};

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
      console.error("Lỗi khi lấy reactions:", error);
    }
  };


  // Hàm gọi API lấy post mới nhất để cập nhật UI khi reaction thay đổi
  const handleReacted = async () => {
    try {
      const updatedPost = await postApi.getPostById(localPost._id);
      setLocalPost(updatedPost);
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết sau reaction:", error);
    }
  };

  return (
    <div
      ref={isLast ? lastRef : null}
      className="
    max-w-2xl mx-auto w-full mb-6 
    bg-[#EEEEEE]
    shadow-[0_0_30px_-10px_rgba(0,0,0.2,0.4)] 
     dark:bg-[#111]/70 
    dark:border-yellow-500/20
    backdrop-blur-xl rounded-2xl p-6 
  "
    >
      <div className="absolute top-4 right-4 z-10" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-yellow-400"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1e1e1f] border border-yellow-300/40 dark:border-yellow-500/20 rounded-md shadow-lg z-20">
            {datauser?.id === UserID?._id ? (
              <>
                <button
                  onClick={() => onEdit?.(localPost)}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-yellow-500/10"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={async () => {
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
                  className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-400/10"
                >
                  🗑️ Delete
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
                className="block w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-green-400/10"
              >
                {isSaved ? "❌ Unsave" : "💾 Save"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={UserID?.Avatar || "https://via.placeholder.com/80"}
          alt="User Avatar"
          className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover"
        />
        <div>
          <p className="font-semibold text-yellow-600 dark:text-yellow-300">
            {UserID?.Name || "Ẩn danh"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(localPost.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Content */}
      {localPost.Content && (
        <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed whitespace-pre-line">
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
              className={`relative group overflow-hidden rounded-lg max-h-[400px] mb-2 md:mb-0 ${localPost.Video?.length > 0 ? "w-full md:w-1/2" : "w-full"
                }`}
            >
              <img
                src={localPost.Image[0]}
                alt="Ảnh bài viết"
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
              />
              {localPost.Image.length > 1 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-semibold">
                  +{localPost.Image.length - 1}
                </div>
              )}
            </div>
          )}

          {localPost.Video?.length > 0 && (
            <div
              className={`relative group overflow-hidden rounded-lg max-h-[400px] ${localPost.Image?.length > 0 ? "w-full md:w-1/2" : "w-full"
                }`}
            >
              <SmartVideo src={localPost.Video[0]} />
              {localPost.Video.length > 1 && (
                <div className="absolute bottom-0 right-0 bg-black/50 px-2 py-1 text-white text-sm rounded-tl-lg">
                  +{localPost.Video.length - 1}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {/* Reaction Summary */}
      <div className="flex justify-between items-center px-6 text-sm text-gray-400 pb-2">
        <div
          className="flex items-center cursor-pointer hover:underline"
          onClick={handleOpenReactions}
        >
          <div className="flex -space-x-2">
            {getTopReactions(localPost.ReactionCounts).map((type, idx) => {
              const r = reactionIconsMap[type];
              return (
                <div
                  key={type}
                  className="w-6 h-6 rounded-full flex items-center justify-center border border-white"
                  style={{
                    backgroundColor: r.bg,
                    zIndex: getTopReactions(localPost.ReactionCounts).length - idx,
                    marginLeft: idx !== 0 ? "-8px" : "0", // chồng icon giống Facebook
                  }}
                >
                  <FontAwesomeIcon
                    icon={r.icon}
                    color={r.color}
                    className="text-xs"
                  />
                </div>
              );
            })}
          </div>
          <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">
            {Object.values(localPost.ReactionCounts || {}).reduce((a, b) => a + b, 0)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span>{localPost.CommentCount || 0} Comments</span>
          <span>{localPost.ShareCount || 0} Shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      {/* Action Buttons */}
      <div className="flex justify-around border-t border-yellow-300/20 dark:border-yellow-500/10 pt-2 mt-2 text-gray-600 dark:text-gray-400 text-sm">
        {/* ✅ Tích hợp Reaction component */}
        <Reaction
          post={localPost}
          onReacted={handleReacted}
        />

        <button
          onClick={() => onClick?.(localPost)}
          className="flex items-center gap-2 hover:text-cyan-300 transition-all"
        >
          <MessageSquare className="w-5 h-5" /> Comment
        </button>

        <button className="flex items-center gap-2 hover:text-green-300 transition-all">
          <Share className="w-5 h-5" /> Share
        </button>
      </div>
      {showReactionModal && (
        <ReactionModal
          groupedReactions={groupedReactions}
          onClose={() => setShowReactionModal(false)}
        />
      )}

    </div>
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