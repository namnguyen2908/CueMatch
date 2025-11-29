import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { useInView } from "react-intersection-observer";
import postApi from "../../api/postApi";
import PostCard from "./PostCard";

const PostList = forwardRef(({ isProfile = false, onPostClick, onEdit, userId = null }, ref) => {
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const { ref: inViewRef, inView } = useInView({ threshold: 0.5 });


  const handleDeletePost = (deletedId) => {
    setPosts((prev) => prev.filter((post) => post._id !== deletedId));
  };


  const fetchPosts = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const newOffset = reset ? 0 : offset;
      let res = [];

      if (isProfile && userId) {
        res = await postApi.getUserPosts(userId, newOffset, 10);
      } else if (isProfile && !userId) {
        res = await postApi.getMyPosts(newOffset, 10);
      } else {
        res = await postApi.getPosts(newOffset, 10);
      }

      if (res.length < 10) setHasMore(false);

      setPosts((prev) => (reset ? res : [...prev, ...res]));
      setOffset((prev) => reset ? 10 : prev + 10);
    } catch (error) {
      console.error("loading fail", error);
    } finally {
      setLoading(false);
    }
  }, [offset, isProfile, loading, userId]);

  // ✅ expose method to parent
  useImperativeHandle(ref, () => ({
    reloadPosts: () => {
      setPosts([]); // clear
      setOffset(0);
      setHasMore(true);
      fetchPosts(true); // reset mode
    }
  }));

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (inView && hasMore) {
      fetchPosts();
    }
  }, [inView]);

  return (
    <>
      <PostCard
        posts={posts}
        lastRef={inViewRef}
        onPostClick={onPostClick}
        onEdit={onEdit}
        onDelete={handleDeletePost}
      />
      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Loading...
          </p>
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            You have read the whole article!
          </p>
        </div>
      )}
      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg mb-2">
            No posts yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Share something with everyone!
          </p>
        </div>
      )}
    </>
  );
});

export default PostList;