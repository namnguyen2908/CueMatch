import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faThumbsUp,
  faFaceGrinSquintTears,
  faFaceSurprise,
  faFaceSadCry,
  faFaceTired,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const reactionIcons = {
  like: { icon: faThumbsUp, color: "#0055ff" },
  love: { icon: faHeart, color: "#ff0b0b" },
  haha: { icon: faFaceGrinSquintTears, color: "#ffd062" },
  wow: { icon: faFaceSurprise, color: "#ffff2d" },
  sad: { icon: faFaceSadCry, color: "#ffc95c" },
  angry: { icon: faFaceTired, color: "#ff9d2d" },
};

const ReactionModal = ({ groupedReactions, onClose }) => {
  const [selectedTab, setSelectedTab] = useState("all");

  const tabs = useMemo(() => {
    const tabList = ["all"];
    for (const type in groupedReactions) {
      if (groupedReactions[type]?.length) {
        tabList.push(type);
      }
    }
    return tabList;
  }, [groupedReactions]);

  const filteredUsers = useMemo(() => {
    if (selectedTab === "all") {
      return Object.values(groupedReactions).flat();
    }
    return groupedReactions[selectedTab] || [];
  }, [groupedReactions, selectedTab]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[#1e1e1f] text-white p-6 rounded-lg max-w-md w-full relative max-h-[80vh] overflow-y-auto">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Reactions</h2>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-600 pb-2 mb-4 overflow-x-auto">
          {tabs.map((type) => {
            const icon = reactionIcons[type]?.icon;
            const color = reactionIcons[type]?.color || "#ccc";
            const count = type === "all"
              ? Object.values(groupedReactions).reduce((sum, arr) => sum + arr.length, 0)
              : groupedReactions[type]?.length || 0;

            return (
              <button
                key={type}
                onClick={() => setSelectedTab(type)}
                className={`px-3 py-1 rounded-full flex items-center gap-1 text-sm ${
                  selectedTab === type ? "bg-yellow-500 text-black" : "bg-[#2a2a2a] text-white"
                }`}
              >
                {icon && <FontAwesomeIcon icon={icon} color={color} />}
                {type === "all" ? "Tất cả" : type.charAt(0).toUpperCase() + type.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* User list */}
        {filteredUsers.length > 0 ? (
          <ul className="space-y-3">
            {filteredUsers.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <img
                  src={item.user.avatar || "https://via.placeholder.com/40"}
                  alt={item.user.name}
                  className="w-9 h-9 rounded-full object-cover border"
                />
                <span>{item.user.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">Không có ai thả cảm xúc này.</p>
        )}
      </div>
    </div>
  );
};

export default ReactionModal;