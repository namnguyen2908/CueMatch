import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import postApi from "../api/postApi";
import PostCard from "./PostCard";

const PostList = ({ isProfile = false }) => {
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView({ threshold: 0.5 });

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = isProfile
        ? await postApi.getMyPosts(offset, 10)
        : await postApi.getPosts(offset, 10);

      if (res.length < 10) setHasMore(false);
      setPosts((prev) => [...prev, ...res]);
      setOffset((prev) => prev + 10);
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  }, [offset, isProfile, hasMore, loading]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (inView) {
      fetchPosts();
    }
  }, [inView]);

  return (
    <>
      <PostCard posts={posts} ref={ref} />
      {loading && <p className="text-center text-gray-400 py-4">Đang tải...</p>}
      {!hasMore && (
        <p className="text-center text-yellow-400 py-4">Không còn bài viết nào nữa.</p>
      )}
    </>
  );
};

export default PostList;