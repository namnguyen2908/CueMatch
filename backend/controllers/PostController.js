const Post = require('../models/Post');
const User = require('../models/User');

const PostController = {
    createPost: async (req, res) => {
        try {
            const { Content, Image, Status, GroupID } = req.body;
            const UserID = req.user.id;
            if (Status == "group" && !GroupID) {
                return res.status(400).json({ message: 'GroupID is required when status is "group"' });
            }
            const newPost = new Post({
                UserID,
                Content,
                Image,
                Status,
                GroupID,
            });
            const savedPost = await newPost.save();
            return res.status(200).json({ message: 'Post created successfully', post: savedPost });
        } catch (err) {
            return res.status(500).json({ message: 'Server error' });
        }
    },

    getPostById: async (req, res) => {
        try {
            const post = await Post.findById(req.params.id).populate('UserID', 'Name Avatar');               //lỗi
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            res.status(200).json(post);
        } catch (err) {
            return res.status(500).json({ message: 'Server error' });
        }
    },

    Update: async (req, res) => {
        try {
            const { Content, Image, Status, GroupID } = req.body;
            const post = await Post.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            if (post.UserID.toString() !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            if (Status === 'group' && !GroupID) {
                return res.status(400).json({ message: 'GroupID is required when status is "group"' });
            }
            post.Content = Content || post.Content;
            post.Image = Image || post.Image;
            post.Status = Status || post.Status;
            post.GroupID = GroupID || post.GroupID;
            const updatedPost = await post.save();
            return res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
        } catch (err) {
            return res.status(500).json({ message: 'Server error' });
        }
    },

    getPosts: async (req, res) => {
        try {
            const { offset = 0, limit = 10 } = req.query;

            const posts = await Post.find({ Status: 'public' })
                .sort({ createdAt: -1 })
                .skip(Number(offset))
                .limit(Number(limit))
                .populate({
                    path: 'UserID',
                    select: 'Name Avatar'
                });
                
            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    deletePost: async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            if (post.UserID.toString() !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized" });
            }
            await post.remove();
            return res.status(200).json({ message: 'Post deleted successfully' });
        } catch (err) {
            return res.status(500).json({ message: 'Server error' });
        }
    },
};

module.exports = PostController;