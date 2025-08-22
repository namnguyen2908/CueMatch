// src/components/postDetail/PostDetailContent.js
import React from "react";
import { Heart, MessageSquare, Share } from "lucide-react";

const Action = ({ icon: Icon, label, hoverColor }) => (
  <button className={`flex items-center gap-2 hover:${hoverColor} transition-all`}>
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const PostDetailContent = ({ post }) => {
  const { UserID, Content, createdAt, Likes, Comments } = post;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={UserID?.Avatar}
          className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover"
          alt=""
        />
        <div>
          <p className="font-semibold text-yellow-300">{UserID?.Name || "Ẩn danh"}</p>
          <p className="text-sm text-gray-500">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <p className="text-gray-200 mb-4 leading-relaxed whitespace-pre-line">{Content}</p>

      {/* Actions */}
      <div className="flex justify-between px-6 text-gray-400 pt-3 border-t border-yellow-500/10">
        <Action icon={Heart} label={Likes?.length || 0} hoverColor="text-red-400" />
        <Action icon={MessageSquare} label={Comments?.length || 0} hoverColor="text-cyan-300" />
        <Action icon={Share} label="Share" hoverColor="text-yellow-300" />
      </div>
    </div>
  );
};

export default PostDetailContent;