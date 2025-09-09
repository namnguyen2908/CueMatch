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
      console.error("Lỗi tải bài viết:", error);
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
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          Đang tải...
        </p>
      )}
      {!hasMore && (
        <p className="text-center text-yellow-600 dark:text-yellow-400 py-4">
          Không còn bài viết nào nữa.
        </p>
      )}
    </>
  );
});

export default PostList;