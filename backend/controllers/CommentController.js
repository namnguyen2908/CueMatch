const Comment = require("../models/Comment");


exports.createComment = async (req, res) => {
    try {
        const { PostID, ParentID, Content } = req.body;
        const UserID = req.user.id; 
        if (!PostID) {
            res.status(404).json({message: "thiếu post id"});
        }
        if (!Content) {
            res.status(404).json({message: "thiếu Content"});
        }

        const comment = new Comment({ PostID, ParentID, Content, UserID });
        await comment.save();
        await comment.populate('UserID', 'Name Avatar');
        res.status(201).json({ success: true, data: comment });
    } catch (err) {
        console.error("Lỗi khi tạo comment:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;

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
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.toggleLikeComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

        const hasLiked = comment.Likes.includes(userId);

        if (hasLiked) {
            // Unlike
            comment.Likes.pull(userId);
        } else {
            // Like
            comment.Likes.push(userId);
        }

        await comment.save();
        res.status(200).json({ success: true, data: comment });
    } catch (err) {
        console.error("Error toggling like:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        await Comment.deleteOne({ _id: commentId });

        await Comment.deleteMany({ ParentID: commentId });

        res.status(200).json({ success: true, message: "Comment deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
