import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Comments from "../Comments";
import PostDetailContent from "./PostDetailContent";
import SmartVideo from "../SmartVideo";

const PostDetailModal = ({ post, isOpen, onClose }) => {
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center 
            bg-black/70 dark:bg-black/80 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative 
              bg-white dark:bg-luxury-800 
              w-[95vw] max-w-7xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden 
              border border-sport-200/30 dark:border-sport-800/30
              flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-50 
                w-10 h-10 rounded-full
                bg-white/90 dark:bg-luxury-800/90 backdrop-blur-xl
                text-luxury-600 dark:text-luxury-400 
                hover:text-sport-600 dark:hover:text-sport-400
                hover:bg-sport-50 dark:hover:bg-sport-900/20
                border border-sport-200/50 dark:border-sport-800/50
                shadow-lg transition-all duration-200
                flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div
              className="w-full md:w-1/2 bg-gradient-to-br from-sport-50 to-sport-100/50 dark:from-luxury-900 dark:to-luxury-950 
              p-6 flex flex-col justify-center items-center relative 
              border-r border-sport-200/30 dark:border-sport-800/30"
            >
              {mediaItems.length > 0 ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mediaIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      {post.Video?.includes(mediaItems[mediaIndex]) ? (
                        <div className="w-full max-h-[75vh] rounded-2xl overflow-hidden bg-black shadow-2xl">
                          <SmartVideo src={mediaItems[mediaIndex]} />
                        </div>
                      ) : (
                        <img
                          src={mediaItems[mediaIndex]}
                          alt={`Media ${mediaIndex + 1}`}
                          className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {mediaItems.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevMedia}
                        className="absolute top-1/2 left-4 transform -translate-y-1/2 
                          w-12 h-12 rounded-full
                          bg-white/90 dark:bg-luxury-800/90 backdrop-blur-xl
                          text-sport-600 dark:text-sport-400
                          hover:bg-gradient-sport hover:text-white
                          border border-sport-200/50 dark:border-sport-800/50
                          shadow-lg transition-all duration-200
                          flex items-center justify-center z-10"
                        aria-label="Previous media"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1, x: 2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextMedia}
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 
                          w-12 h-12 rounded-full
                          bg-white/90 dark:bg-luxury-800/90 backdrop-blur-xl
                          text-sport-600 dark:text-sport-400
                          hover:bg-gradient-sport hover:text-white
                          border border-sport-200/50 dark:border-sport-800/50
                          shadow-lg transition-all duration-200
                          flex items-center justify-center z-10"
                        aria-label="Next media"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </motion.button>

                      <div
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                        bg-white/90 dark:bg-luxury-800/90 backdrop-blur-xl
                        text-sport-700 dark:text-sport-300
                        px-4 py-2 rounded-full text-sm font-semibold
                        border border-sport-200/50 dark:border-sport-800/50
                        shadow-lg"
                      >
                        {mediaIndex + 1} / {mediaItems.length}
                      </div>

                      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {mediaItems.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setMediaIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              idx === mediaIndex
                                ? "bg-gradient-sport w-6 shadow-glow-orange"
                                : "bg-sport-300/50 dark:bg-sport-700/50 hover:bg-sport-400/70"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="w-24 h-24 rounded-full bg-sport-100 dark:bg-sport-900/30 flex items-center justify-center mb-4">
                    <X className="w-12 h-12 text-sport-400 dark:text-sport-500" />
                  </div>
                  <p className="text-luxury-600 dark:text-luxury-400 text-lg font-medium">
                    No media available
                  </p>
                </div>
              )}
            </div>

            <div
              className="w-full md:w-1/2 p-6 overflow-y-auto 
              flex flex-col gap-6
              scrollbar-hide
              bg-white dark:bg-luxury-800"
            >
              <PostDetailContent post={post} />
              <div className="border-t border-sport-200/30 dark:border-sport-800/30 pt-6">
                <Comments postId={post._id} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostDetailModal;