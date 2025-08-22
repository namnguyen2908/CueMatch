// src/components/postDetail/PostDetailModal.js
import React, { useState } from "react";
import { X } from "lucide-react";
import Comments from "../Comments";
import PostDetailContent from "./PostDetailContent";

const PostDetailModal = ({ post, isOpen, onClose }) => {
  const [mediaIndex, setMediaIndex] = useState(0);

  if (!isOpen || !post) return null;

  // Gom ảnh và video chung thành 1 mảng mediaItems
  const mediaItems = [...(post.Image || []), ...(post.Video || [])];

  const prevMedia = (e) => {
    e.stopPropagation();
    setMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const nextMedia = (e) => {
    e.stopPropagation();
    setMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#1e1e1f] w-[96vw] h-[92vh] rounded-xl shadow-2xl overflow-hidden border border-yellow-500/20 flex animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-gray-400 hover:text-yellow-400"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Cột trái - media với carousel */}
        <div className="w-1/2 bg-black p-4 flex flex-col justify-center items-center relative max-h-full">
          {mediaItems.length > 0 ? (
            <>
              {/* Hiển thị media hiện tại */}
              {post.Video?.includes(mediaItems[mediaIndex]) ? (
                <video
                  key={mediaIndex}
                  src={mediaItems[mediaIndex]}
                  controls
                  autoPlay
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <img
                  key={mediaIndex}
                  src={mediaItems[mediaIndex]}
                  alt={`Media ${mediaIndex + 1}`}
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}

              {/* Nút prev */}
              {mediaItems.length > 1 && (
                <button
                  onClick={prevMedia}
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/70 text-yellow-300 rounded-full p-3 shadow-lg hover:scale-110 hover:bg-yellow-500 hover:text-black transition-all duration-300"
                  aria-label="Previous media"
                >
                  ‹
                </button>
              )}

              {/* Nút next */}
              {mediaItems.length > 1 && (
                <button
                  onClick={nextMedia}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/70 text-yellow-300 rounded-full p-3 shadow-lg hover:scale-110 hover:bg-yellow-500 hover:text-black transition-all duration-300"
                  aria-label="Next media"
                >
                  ›
                </button>
              )}

              {/* Indicator */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-2 right-4 bg-black/70 text-yellow-300 px-3 py-1 rounded-md text-sm select-none">
                  {mediaIndex + 1} / {mediaItems.length}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 italic">No media</p>
          )}
        </div>

        {/* Cột phải - content + like + comment */}
        <div className="w-1/2 p-6 overflow-y-auto max-h-[90vh] flex flex-col justify-start scrollbar-hide">
          <PostDetailContent post={post} />
          <Comments postId={post._id} />
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;