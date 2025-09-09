import React, { useState } from "react";
import { X } from "lucide-react";
import Comments from "../Comments";
import PostDetailContent from "./PostDetailContent";

const PostDetailModal = ({ post, isOpen, onClose }) => {
  const [mediaIndex, setMediaIndex] = useState(0);

  if (!isOpen || !post) return null;

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
      <div className="relative 
        bg-white dark:bg-[#1e1e1f] 
        w-[96vw] h-[92vh] rounded-xl shadow-2xl overflow-hidden 
        border border-yellow-500/20 dark:border-yellow-400/30
        flex animate-fadeIn"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 
            text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left column - media */}
        <div className="w-1/2 bg-gray-100 dark:bg-black p-4 flex flex-col justify-center items-center relative max-h-full">
          {mediaItems.length > 0 ? (
            <>
              {post.Video?.includes(mediaItems[mediaIndex]) ? (
                <video
                  key={mediaIndex}
                  src={mediaItems[mediaIndex]}
                  controls
                  autoPlay
                  className="w-full max-h-[70vh] object-contain rounded-lg bg-black"
                />
              ) : (
                <img
                  key={mediaIndex}
                  src={mediaItems[mediaIndex]}
                  alt={`Media ${mediaIndex + 1}`}
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}

              {mediaItems.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 
                      bg-black/70 text-yellow-500 rounded-full p-3 shadow-lg 
                      hover:scale-110 hover:bg-yellow-500 hover:text-black transition-all duration-300"
                    aria-label="Previous media"
                  >
                    ‹
                  </button>

                  <button
                    onClick={nextMedia}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 
                      bg-black/70 text-yellow-500 rounded-full p-3 shadow-lg 
                      hover:scale-110 hover:bg-yellow-500 hover:text-black transition-all duration-300"
                    aria-label="Next media"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-2 right-4 bg-black/70 text-yellow-500 px-3 py-1 rounded-md text-sm select-none">
                    {mediaIndex + 1} / {mediaItems.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No media</p>
          )}
        </div>

        {/* Right column - content + comments */}
        <div className="w-1/2 p-6 overflow-y-auto max-h-[90vh] flex flex-col justify-start scrollbar-hide
          text-gray-900 dark:text-gray-200"
        >
          <PostDetailContent post={post} />
          <Comments postId={post._id} />
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
