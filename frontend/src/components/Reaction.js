import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faHeart,
  faFaceGrinSquintTears,
  faFaceSurprise,
  faFaceSadCry,
  faFaceTired,
} from "@fortawesome/free-solid-svg-icons";
import reactionApi from "../api/reactionApi";

// Danh sách reaction
const reactions = [
  {
    type: "like",
    icon: faThumbsUp,
    color: "#0055ff",
    bg: "#0055ff",
  },
  {
    type: "love",
    icon: faHeart,
    color: "#ff0b0b",
  },
  {
    type: "haha",
    icon: faFaceGrinSquintTears,
    color: "#ffd062",
  },
  {
    type: "wow",
    icon: faFaceSurprise,
    color: "#ffff2d",
  },
  {
    type: "sad",
    icon: faFaceSadCry,
    color: "#ffc95c",
  },
  {
    type: "angry",
    icon: faFaceTired,
    color: "#ff9d2d",
  },
];

// Tạo map để dễ truy xuất theo type
const reactionMap = reactions.reduce((acc, r) => {
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
      alert("Có lỗi xảy ra khi gửi reaction!");
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

  const currentReaction = currentUserReaction ? reactionMap[currentUserReaction] : null;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        disabled={loading}
        className={`flex items-center gap-2 transition-all ${currentReaction ? "text-red-400" : "hover:text-red-400"
          }`}
      >
        {currentReaction ? (
          <FontAwesomeIcon
            icon={currentReaction.icon}
            color={currentReaction.color}
            className="text-lg"
          />
        ) : (
          <FontAwesomeIcon icon={faHeart} className="text-lg" />
        )}
        <span>{currentReaction ? currentReaction.type.charAt(0).toUpperCase() + currentReaction.type.slice(1) : "Heart"}</span>
      </button>

      {showPicker && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-[#222] border border-yellow-500/20 rounded-full px-3 py-2 shadow-lg">
          {reactions.map((r) => (
            <button
              key={r.type}
              onClick={() => handleReaction(r.type)}
              title={r.type}
              className={`text-xl transition-transform hover:scale-125 ${currentUserReaction === r.type ? "opacity-100" : "opacity-70"
                }`}
            >
              <FontAwesomeIcon icon={r.icon} color={r.color} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reaction;
