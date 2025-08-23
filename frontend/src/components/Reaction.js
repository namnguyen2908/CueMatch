import React, { useState, useRef } from "react";
import { Heart } from "lucide-react";
import reactionApi from "../api/reactionApi";

const reactions = [
  { type: "like", icon: "👍" },
  { type: "love", icon: "❤️" },
  { type: "haha", icon: "😂" },
  { type: "wow", icon: "😮" },
  { type: "sad", icon: "😢" },
  { type: "angry", icon: "😡" },
];

const Reaction = ({ post, currentUserReaction, onReacted }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const hideTimer = useRef(null);

  // Tổng số reaction của bài viết (cộng các loại)
  const total = Object.values(post.ReactionCounts || {}).reduce((a, b) => a + b, 0);

  const handleReaction = async (type) => {
    if (loading) return;
    setLoading(true);

    try {
      if (currentUserReaction === type) {
        // Nếu click lại reaction đang có => xóa reaction
        await reactionApi.deleteReaction(post._id);
      } else {
        // Thêm hoặc cập nhật reaction mới
        await reactionApi.reactionToPost(post._id, type);
      }

      onReacted?.(post._id); // Gọi callback để parent biết và cập nhật lại bài post này
      setShowPicker(false);
    } catch (err) {
      console.error("Lỗi khi gửi reaction:", err);
      alert("Có lỗi xảy ra khi gửi reaction!");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    setShowPicker(true);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => {
      setShowPicker(false);
    }, 200);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        disabled={loading}
        className={`flex items-center gap-2 transition-all ${
          currentUserReaction ? "text-red-400" : "hover:text-red-400"
        }`}
      >
        <Heart className="w-5 h-5" />
        <span>{total}</span>
      </button>

      {showPicker && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-[#222] border border-yellow-500/20 rounded-full px-3 py-2 shadow-lg"
        >
          {reactions.map((r) => (
            <button
              key={r.type}
              onClick={() => handleReaction(r.type)}
              className={`text-xl transition-transform hover:scale-125 ${
                currentUserReaction === r.type ? "opacity-100" : "opacity-70"
              }`}
              title={r.type}
            >
              {r.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reaction;
