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
            console.error("Error sending comment:", err.message);
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
            <h3 className="text-black dark:text-[#FFFFFF] font-semibold mb-2">Comments</h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide max-h-[50vh]">
                {comments.length === 0 ? (
                    <p className="text-gray-500 dark:text-white italic">No comments yet.</p>
                ) : (
                    renderComments(comments)
                )}
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex items-start gap-3 border-t border-yellow-500/20 dark:border-yellow-400/30 pt-4 mt-4"
            >
                <img
                    src={datauser.avatar}
                    className="w-10 h-10 rounded-full object-cover"
                    alt=""
                />
                <div className="flex-1 flex items-center bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-2">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write a comment..."
                        className="bg-transparent flex-1 outline-none text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button className="text-[#FF9100] hover:text-[#FFBA51] ml-3 font-semibold transition-transform hover:scale-105">
                        Send
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
            setLikesCount(res.Likes?.length);
        } catch (err) {
            console.error("Error liking comment: ", err.message);
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
            console.error("Error sending reply:", err.message);
        }
    };

    return (
        <div className={`mb-3 mt-3 ${level > 0 ? "ml-6" : ""}`}>
            <div className="flex items-start gap-3">
                <img
                    src={comment.UserID?.Avatar}
                    className="w-9 h-9 rounded-full object-cover"
                    alt=""
                />

                <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 text-sm text-gray-200">
                        <span className="font-semibold text-[#FF9A00]">{comment.UserID?.Name}</span>
                        <div className="mt-1 whitespace-pre-line text-black dark:text-white ">{comment.Content}</div>
                    </div>

                    <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-4 mt-1 ml-1">
                        <button onClick={handleToggleLike} className="hover:text-yellow-300">
                            {isLiked ? "💛" : "🤍"} {likesCount}
                        </button>
                        {level < 2 && (
                            <button
                                onClick={() => setShowReply(!showReply)}
                                className="hover:text-yellow-300"
                            >
                                Reply
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
                                    placeholder={`Reply ${comment.UserID?.Name}...`}
                                    className="w-full px-4 py-2 text-sm rounded-full bg-gray-300 dark:bg-gray-900 text-gray-200 outline-none focus:ring-2 focus:ring-[#FFF2DA] transition"
                                />
                            </div>
                            <button
                                onClick={handleReply}
                                className="text-[#FF9100] font-medium hover:text-[#FFBA51] mt-1"
                            >
                                Send
                            </button>
                        </div>
                    )}

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