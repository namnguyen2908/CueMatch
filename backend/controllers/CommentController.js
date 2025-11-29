const Comment = require("../models/Comment");
const Post = require('../models/Post');
const { createNotification } = require('./NotificationController');
const mongoose = require('mongoose');

// Helper function to get socket.io instance
const getSocketIO = (req) => {
    return req.app.get('socketio');
};

exports.createComment = async (req, res) => {
    try {
        const { PostID, ParentID, Content } = req.body;
        const UserID = req.user.id;

        // Validate required fields
        if (!PostID) {
            return res.status(400).json({ success: false, message: "PostID is required" });
        }

        // Validate PostID format
        if (!mongoose.Types.ObjectId.isValid(PostID)) {
            return res.status(400).json({ success: false, message: "Invalid PostID format" });
        }

        // Validate Content
        if (!Content || Content.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Content cannot be empty" });
        }

        // Validate Content length
        if (Content.length > 1000) {
            return res.status(400).json({ success: false, message: "Content must not exceed 1000 characters" });
        }

        // Validate ParentID format if provided
        if (ParentID && !mongoose.Types.ObjectId.isValid(ParentID)) {
            return res.status(400).json({ success: false, message: "Invalid ParentID format" });
        }

        // Check if post exists
        const post = await Post.findById(PostID);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // If ParentID is provided, validate that parent comment exists and belongs to same post
        if (ParentID) {
            const parentComment = await Comment.findById(ParentID);
            if (!parentComment) {
                return res.status(404).json({ success: false, message: "Parent comment not found" });
            }
            if (parentComment.PostID.toString() !== PostID.toString()) {
                return res.status(400).json({ success: false, message: "Parent comment does not belong to this post" });
            }
        }

        const comment = new Comment({ 
            PostID, 
            ParentID: ParentID || null, 
            Content: Content.trim(), 
            UserID 
        });
        await comment.save();
        await comment.populate('UserID', 'Name Avatar');
        await Post.findByIdAndUpdate(PostID, { $inc: { CommentCount: 1 } });

        // Tạo thông báo cho chủ bài viết
        if (post && post.UserID.toString() !== UserID.toString()) {
            const notification = await createNotification(
                post.UserID,
                UserID,
                'comment',
                { postId: PostID, commentId: comment._id }
            );

            // Gửi thông báo real-time qua socket
            const io = getSocketIO(req);
            if (io && notification) {
                io.to(`user:${post.UserID}`).emit('new_notification', notification);
            }
        }

        res.status(201).json({ success: true, data: comment });
    } catch (err) {
        console.error("Error creating comment:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

exports.getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;

        // Validate postId format
        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ success: false, message: "Invalid post ID format" });
        }

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const comments = await Comment.find({ PostID: postId })
            .populate('UserID', 'Name Avatar')
            .sort({ createdAt: 1 });

        const commentMap = {};
        comments.forEach(c => commentMap[c._id] = { ...c._doc, children: [] });

        const rootComments = [];

        comments.forEach(c => {
            if (c.ParentID) {
                commentMap[c.ParentID]?.children.push(commentMap[c._id]);
            } else {
                rootComments.push(commentMap[c._id]);
            }
        });

        res.status(200).json({ success: true, data: rootComments });
    } catch (err) {
        console.error("Error getting comments:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};


exports.toggleLikeComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        // Validate commentId format
        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ success: false, message: "Invalid comment ID format" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        const hasLiked = comment.Likes.some(likeId => likeId.toString() === userId.toString());

        if (hasLiked) {
            // Unlike
            comment.Likes = comment.Likes.filter(likeId => likeId.toString() !== userId.toString());
        } else {
            // Like
            comment.Likes.push(userId);
        }

        await comment.save();
        res.status(200).json({ success: true, data: comment });
    } catch (err) {
        console.error("Error toggling like:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        // Validate commentId format
        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ success: false, message: "Invalid comment ID format" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        // Check if user has permission to delete (only owner can delete)
        if (comment.UserID.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You do not have permission to delete this comment" });
        }

        // ✅ Giảm CommentCount trong Post
        // 1 comment cha + n comment con
        const childCount = await Comment.countDocuments({ ParentID: commentId });
        const totalDeleted = 1 + childCount;

        await Comment.deleteOne({ _id: commentId });
        await Comment.deleteMany({ ParentID: commentId });

        await Post.findByIdAndUpdate(comment.PostID, { $inc: { CommentCount: -totalDeleted } });

        res.status(200).json({ success: true, message: "Comment deleted successfully", deleted: totalDeleted });
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
