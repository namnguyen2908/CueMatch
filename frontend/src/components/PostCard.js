// src/components/PostCard.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
  memo,
} from "react";
import { Heart, MessageSquare, Share } from "lucide-react";
import postApi from "../api/postApi";

const LIMIT = 5;

const Skeleton = () => (
  <div className="bg-black/40 border border-yellow-500/20 backdrop-blur-xl rounded-2xl p-6 mb-8 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-[#2a2a2a]" />
      <div className="flex-1">
        <div className="h-4 bg-[#2a2a2a] rounded w-40 mb-2" />
        <div className="h-3 bg-[#2a2a2a] rounded w-28" />
      </div>
    </div>
    <div className="h-4 bg-[#2a2a2a] rounded w-11/12 mb-3" />
    <div className="h-4 bg-[#2a2a2a] rounded w-9/12 mb-4" />
    <div className="h-48 bg-[#2a2a2a] rounded-xl" />
  </div>
);

const Card = memo(function Card({ post, isLast, lastRef }) {
  return (
    <div
      ref={isLast ? lastRef : null}
      className="group bg-black/45 backdrop-blur-xl border border-yellow-500/25 rounded-2xl p-6 mb-8
                 shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-1 transition-all duration-500"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400">
          <img
            src={post.UserID?.Avatar || "https://via.placeholder.com/80"}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-yellow-300">
            {post.UserID?.Name || "Ẩn danh"}
          </h4>
          <p className="text-sm text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.Content && (
        <p className="text-gray-200 mb-4 leading-relaxed">{post.Content}</p>
      )}

      {post.Image && (
        <div className="overflow-hidden rounded-xl mb-4">
          <img
            src={post.Image}
            alt="Post"
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-6 text-gray-400">
        <button
          className="flex items-center gap-2 hover:text-red-400 transition-all 
                     hover:drop-shadow-[0_0_12px_rgba(248,113,113,0.7)]"
        >
          <Heart className="w-5 h-5" />
          <span>{post.Likes?.length || 0}</span>
        </button>
        <button
          className="flex items-center gap-2 hover:text-cyan-300 transition-all 
                     hover:drop-shadow-[0_0_12px_rgba(103,232,249,0.7)]"
        >
          <MessageSquare className="w-5 h-5" />
          <span>{post.Comments?.length || 0}</span>
        </button>
        <button
          className="flex items-center gap-2 hover:text-yellow-300 transition-all 
                     hover:drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]"
        >
          <Share className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
});

const PostCard = forwardRef((props, ref) => {
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observer = useRef();

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (loading || (!hasMore && !reset)) return;

      setLoading(true);
      setError(null);

      try {
        const newOffset = reset ? 0 : offset;
        const data = await postApi.getPosts(newOffset, LIMIT);

        if (data.length < LIMIT) setHasMore(false);

        if (reset) {
          setPosts(data);
          setOffset(LIMIT);
          setHasMore(true);
        } else {
          setPosts((prev) => [...prev, ...data]);
          setOffset((prev) => prev + LIMIT);
        }
      } catch (e) {
        setError("Đã có lỗi khi tải bài viết. Vui lòng thử lại.");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [offset, loading, hasMore]
  );

  useImperativeHandle(ref, () => ({
    reloadPosts: () => {
      setInitialLoading(true);
      fetchPosts(true);
    },
  }));

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchPosts]
  );

  return (
    <div>
      {/* lỗi */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300">
          {error}
        </div>
      )}

      {/* skeleton cho lần đầu */}
      {initialLoading && posts.length === 0 ? (
        <>
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        posts.map((post, idx) => (
          <Card
            key={post._id}
            post={post}
            isLast={idx === posts.length - 1}
            lastRef={lastPostRef}
          />
        ))
      )}

      {/* loading thêm */}
      {loading && posts.length > 0 && (
        <div className="text-center py-4 text-gray-400">Đang tải…</div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center text-gray-500 py-6">
          Không còn bài viết nào nữa.
        </div>
      )}
    </div>
  );
});

export default PostCard;
