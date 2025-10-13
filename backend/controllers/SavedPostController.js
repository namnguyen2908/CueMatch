const SavedPost = require("../models/SavedPost");
const Post = require("../models/Post");

const SavedPostController = {
    savePost: async (req, res) => {
        try {
            const { postId } = req.body;
            const userId = req.user.id;
            const post = await Post.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found" });
            const saved = await SavedPost.create({
                UserID: userId,
                PostID: postId
            });

            return res.status(201).json({ message: "Post saved successfully", saved });
        } catch (err) {
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    },

    unsavePost: async (req, res) => {

        try {
            const { postId } = req.params;
            const userId = req.user.id;
            const deleted = await SavedPost.findOneAndDelete({ UserID: userId, PostID: postId });
            if (!deleted) return res.status(404).json({ message: "Saved post not found" });

            return res.status(200).json({ message: "Post unsaved successfully" });
        } catch (err) {
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    },

    getSavedPost: async (req, res) => {
        try {
            const userId = req.user.id;
            const savedPosts = await SavedPost.find({ UserID: userId })
                .sort({ createdAt: -1 })
                .populate({
                    path: "PostID",
                    populate: { path: "UserID", select: "Name Avatar" }
                });

            return res.status(200).json({ savedPosts });
        } catch (err) {
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    },

    checkSaved: async (req, res) => {
        try {
            const { postId } = req.params;
            const userId = req.user.id;
            const exists = await SavedPost.exists({ UserID: userId, PostID: postId });
            return res.status(200).json({ isSaved: !!exists });
        } catch (err) {
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    },
};

module.exports = SavedPostController;