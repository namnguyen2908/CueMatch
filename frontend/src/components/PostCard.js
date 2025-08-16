import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Heart, MessageSquare, Share } from 'lucide-react';
import postApi from '../api/postApi';

const LIMIT = 5;

const PostCard = () => {
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const observer = useRef();

  // Fetch posts with pagination
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);
    try {
      const data = await postApi.getPosts(offset, LIMIT);
      if (data.length < LIMIT) {
        setHasMore(false);
      }
      setPosts((prev) => [...prev, ...data]);
      setOffset((prev) => prev + LIMIT);
    } catch (err) {
      setError('Lỗi khi tải bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [offset, loading, hasMore]);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Infinite scroll: Observer
  const lastPostRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchPosts]);

  return (
    <div>
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1;
        return (
          <div
            key={post._id}
            ref={isLast ? lastPostRef : null}
            className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={post.UserID?.Avatar || 'https://via.placeholder.com/40'}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  {post.UserID?.Name || 'Ẩn danh'}
                </h4>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-gray-800 mb-3">{post.Content}</p>
            {post.Image && (
              <img src={post.Image} alt="Post" className="w-full rounded-lg mb-4" />
            )}

            <div className="flex space-x-6 text-gray-600">
              <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span>{post.Likes?.length || 0}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span>{post.Comments?.length || 0}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                <Share className="w-5 h-5" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="text-center py-4 text-gray-500">
          Đang tải thêm bài viết...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 py-4">
          {error}
        </div>
      )}

      {!hasMore && (
        <div className="text-center text-gray-400 py-4">
          Không còn bài viết nào nữa.
        </div>
      )}
    </div>
  );
};

export default PostCard;
