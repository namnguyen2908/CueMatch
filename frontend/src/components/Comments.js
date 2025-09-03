import { useUser } from '../contexts/UserContext';
import React, { useEffect, useState } from "react";
import commentApi from '../api/commentApi';

const Comments = ({ postId }) => {
    const [content, setContent] = useState("");
    const [comments, setComments] = useState([]);
    const { datauser } = useUser();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await commentApi.getCommentsByPost(postId);
                setComments(data);
            } catch (err) {
                console.error("fetchComment: ", err.message);
            }
        };
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const newComment = await commentApi.createComment({
                PostID: postId,
                Content: content,
            });
            setComments(prev => [...prev, { ...newComment, children: [] }]);
            setContent("");
        } catch (err) {
            console.error("Lỗi khi gửi comment:", err.message);
        }
    };

    const renderComments = (commentsList, level = 0) => {
        return commentsList.map(comment => (
            <CommentItem
                key={comment._id}
                comment={comment}
                level={level}
                postId={postId}
                onReplyAdded={(reply) => {
                    // Gắn reply vào cây bình luận hiện tại
                    setComments(prev => {
                        const attachReply = (nodes) =>
                            nodes.map(node => {
                                if (node._id === comment._id) {
                                    return {
                                        ...node,
                                        children: [...(node.children || []), reply]
                                    };
                                } else if (node.children) {
                                    return {
                                        ...node,
                                        children: attachReply(node.children)
                                    };
                                }
                                return node;
                            });
                        return attachReply(prev);
                    });
                }}
            />
        ));
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-yellow-300 font-semibold mb-2">Bình luận</h3>

            {/* Scrollable comment area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide max-h-[50vh]">
                {comments.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có bình luận nào.</p>
                ) : (
                    renderComments(comments)
                )}
            </div>

            {/* Fixed input box */}
            <form
                onSubmit={handleSubmit}
                className="flex items-start gap-3 border-t border-yellow-500/20 pt-4 mt-4"
            >
                <img
                    src={datauser.avatar}
                    className="w-10 h-10 rounded-full object-cover"
                    alt=""
                />
                <div className="flex-1 flex items-center bg-[#2a2a2a] rounded-full px-4 py-2">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Viết bình luận..."
                        className="bg-transparent flex-1 outline-none text-gray-200 placeholder-gray-400"
                    />
                    <button className="text-yellow-400 hover:text-yellow-300 ml-3 font-semibold transition-transform hover:scale-105">
                        Gửi
                    </button>
                </div>
            </form>
        </div>

    );
};

const CommentItem = ({ comment, level, postId, onReplyAdded }) => {
    const { datauser } = useUser();
    const [replyContent, setReplyContent] = useState("");
    const [showReply, setShowReply] = useState(false);
    const [likesCount, setLikesCount] = useState(comment.Likes?.length || 0);
    const [children, setChildren] = useState(comment.children || []);
    const [isLiked, setIsLiked] = useState(() =>
        comment.Likes?.some(like =>
            like.user === datauser.id || like.user?._id === datauser.id
        )
    );
    const handleToggleLike = async () => {
        try {
            const res = await commentApi.toggleLikeComment(comment._id);
            setIsLiked(res.liked);
            console.log(res.Likes?.length);
            setLikesCount(res.Likes?.length); // ✅ fix chỗ này: đúng là "likeCount" (không phải "likesCount")
        } catch (err) {
            console.error("Lỗi like comment: ", err.message);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        try {
            const newReply = await commentApi.createComment({
                PostID: postId,
                ParentID: comment._id,
                Content: replyContent
            });
            setChildren(prev => [...prev, newReply]);
            setReplyContent("");
            setShowReply(false);
            if (onReplyAdded) onReplyAdded(newReply);
        } catch (err) {
            console.error("Lỗi gửi phản hồi:", err.message);
        }
    };

    return (
        <div className={` mb-3 mt-3 ${level > 0 ? "" : ""}`}>
            <div className="flex items-start gap-3">
                <img
                    src={comment.UserID?.Avatar || "https://via.placeholder.com/40"}
                    className="w-9 h-9 rounded-full object-cover"
                    alt=""
                />

                <div className="flex-1">
                    <div className="bg-[#3a3b3c] rounded-2xl px-4 py-2 text-sm text-gray-200 max-w-full">
                        <span className="font-semibold text-yellow-300">{comment.UserID?.Name}</span>
                        <div className="mt-1 whitespace-pre-line">{comment.Content}</div>
                    </div>

                    <div className="text-xs text-gray-400 flex items-center gap-4 mt-1 ml-1">
                        <button onClick={handleToggleLike} className="hover:text-yellow-300">
                            {isLiked ? "💛" : "🤍"} {likesCount}
                        </button>
                        {level < 2 && (
                            <button
                                onClick={() => setShowReply(!showReply)}
                                className="hover:text-yellow-300"
                            >
                                Trả lời
                            </button>
                        )}
                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>

                    {showReply && level < 2 && (
                        <div className="mt-2 flex items-start gap-2">
                            <img
                                src={datauser.avatar}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Trả lời ${comment.UserID?.Name}...`}
                                    className="w-full px-4 py-2 text-sm rounded-full bg-[#2f2f2f] text-gray-200 outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                />
                            </div>
                            <button
                                onClick={handleReply}
                                className="text-yellow-400 font-medium hover:text-yellow-300 mt-1"
                            >
                                Gửi
                            </button>
                        </div>
                    )}

                    {/* Render replies */}
                    {children.length > 0 && level < 2 && (
                        <div className="mt-2 space-y-2">
                            {children.map((child) => (
                                <CommentItem
                                    key={child._id}
                                    comment={child}
                                    level={level + 1}
                                    postId={postId}
                                    onReplyAdded={onReplyAdded}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>


    );
};

export default Comments;