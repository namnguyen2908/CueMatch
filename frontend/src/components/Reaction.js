import React, { useState, useRef, useEffect } from "react";
import reactionApi from "../api/reactionApi";

export const REACTION_CONFIG = [
  {
    type: "like",
    label: "Like",
    emoji: "👍",
    color: "#1877F2",
    bg: "#E7F3FF",
  },
  {
    type: "love",
    label: "Love",
    emoji: "❤️",
    color: "#F02849",
    bg: "#FFE4EA",
  },
  {
    type: "care",
    label: "Care",
    emoji: "🤗",
    color: "#FFD76A",
    bg: "#FFF4D4",
  },
  {
    type: "haha",
    label: "Haha",
    emoji: "😂",
    color: "#F7B125",
    bg: "#FFF2D5",
  },
  {
    type: "wow",
    label: "Wow",
    emoji: "😮",
    color: "#F7B125",
    bg: "#FFF2D5",
  },
  {
    type: "sad",
    label: "Sad",
    emoji: "😢",
    color: "#F7B125",
    bg: "#FFEFE1",
  },
  {
    type: "angry",
    label: "Angry",
    emoji: "😡",
    color: "#E9710F",
    bg: "#FFE4DB",
  },
];

export const REACTION_MAP = REACTION_CONFIG.reduce((acc, r) => {
  acc[r.type] = r;
  return acc;
}, {});

const Reaction = ({ post, onReacted }) => {
  const [currentUserReaction, setCurrentUserReaction] = useState(post?.CurrentUserReaction || null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const hideTimer = useRef(null);


  const handleReaction = async (type) => {
    if (loading) return;
    setLoading(true);

    const isRemove = currentUserReaction === type;
    const newReaction = isRemove ? null : type;

    setCurrentUserReaction(newReaction);

    try {
      if (isRemove) {
        await reactionApi.deleteReaction(post._id);
      } else {
        await reactionApi.reactionToPost(post._id, type);
      }

      onReacted?.(post._id);
      setShowPicker(false);
    } catch (err) {
      console.error("Lỗi khi gửi reaction:", err);
      alert("An error occurred while sending reaction!");
      setCurrentUserReaction(post?.CurrentUserReaction || null);
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

  const currentReaction = currentUserReaction ? REACTION_MAP[currentUserReaction] : null;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        disabled={loading}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
          currentReaction ? "bg-luxury-100 text-sport-600" : "text-luxury-600 dark:text-luxury-200"
        }`}
      >
        <span className="text-xl leading-none">{currentReaction ? currentReaction.emoji : "👍"}</span>
        <span className="text-sm font-semibold">
          {currentReaction ? currentReaction.label : "React"}
        </span>
      </button>

      {showPicker && (
        <div
          className="absolute bottom-full mb-3 left-0 translate-x-0 z-[1050]
            flex gap-1 overflow-visible
            bg-white dark:bg-[#1d1d1d]
            border border-luxury-200/60 dark:border-luxury-800/60
            rounded-2xl px-4 py-2 shadow-2xl
            transition-all"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {REACTION_CONFIG.map((r) => (
            <button
              key={r.type}
              onClick={() => handleReaction(r.type)}
              title={r.label}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition-all text-xs ${
                currentUserReaction === r.type
                  ? "bg-luxury-50 dark:bg-luxury-900/60 shadow"
                  : "opacity-80"
              }`}
            >
              <span className="text-xl">{r.emoji}</span>
              <span className="text-[9px] font-semibold text-luxury-600 dark:text-luxury-200">
                {r.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reaction;
