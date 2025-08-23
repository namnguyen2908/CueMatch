// src/components/PostCard.jsx
import React, { memo, useState, useRef, useEffect } from "react";
import { Heart, MessageSquare, Share, MoreVertical } from "lucide-react";
import SmartVideo from "../SmartVideo";
import postApi from "../../api/postApi";
import { useUser } from "../../contexts/UserContext";
import Reaction from "../Reaction";

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

  // Quản lý state local cho post để cập nhật UI khi có thay đổi reaction
  const [localPost, setLocalPost] = useState(post);
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
      className="bg-[#111]/70 border border-yellow-500/20 backdrop-blur-xl rounded-2xl p-6 mb-6 transition-all duration-300 hover:shadow-yellow-500/10 hover:-translate-y-0.5"
    >
      <div className="absolute top-4 right-4 z-10" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-yellow-400"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-36 bg-[#1e1e1f] border border-yellow-500/20 rounded-md shadow-lg z-20">
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
                onClick={() => alert("Post saved (fake logic)")}
                className="block w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-green-400/10"
              >
                💾 Save
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
          <p className="font-semibold text-yellow-300">{UserID?.Name || "Ẩn danh"}</p>
          <p className="text-sm text-gray-500">{new Date(localPost.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Content */}
      {localPost.Content && (
        <p className="text-gray-200 mb-4 leading-relaxed whitespace-pre-line">
          {localPost.Content}
        </p>
      )}

      {/* Media */}
      {(localPost.Image?.length > 0 || localPost.Video?.length > 0) && (
        <div
          onClick={() => onClick?.(localPost)}
          className={`flex ${
            localPost.Image?.length > 0 && localPost.Video?.length > 0
              ? "flex-col md:flex-row gap-4"
              : ""
          } mb-4`}
        >
          {localPost.Image?.length > 0 && (
            <div
              className={`relative group overflow-hidden rounded-lg max-h-[400px] mb-2 md:mb-0 ${
                localPost.Video?.length > 0 ? "w-full md:w-1/2" : "w-full"
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
              className={`relative group overflow-hidden rounded-lg max-h-[400px] ${
                localPost.Image?.length > 0 ? "w-full md:w-1/2" : "w-full"
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
      <div className="flex justify-between px-6 text-gray-400 pt-2 border-t border-yellow-500/10">
        <Reaction
          post={localPost}
          currentUserReaction={localPost.CurrentUserReaction}
          onReacted={handleReacted}
        />
        <Action
          onClick={() => onClick?.(localPost)}
          icon={MessageSquare}
          label={localPost.CommentCount || 0}
          hoverColor="text-cyan-300"
        />
        <Action icon={Share} label="Share" hoverColor="text-yellow-300" />
      </div>
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
