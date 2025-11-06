const Post = require('../models/Post');
const User = require('../models/User');
const Reaction = require('../models/Reaction');

const PostController = {
    createPost: async (req, res) => {
        try {
            const { Content, Status } = req.body;
            const UserID = req.user?.id;

            if (!UserID) {
                return res.status(400).json({ message: 'UserID is required' });
            }

            // ✅ Chỉ cho phép status là 'public' hoặc 'friends'
            const allowedStatuses = ['public', 'friends'];
            if (Status && !allowedStatuses.includes(Status)) {
                return res.status(400).json({ message: 'Invalid status value' });
            }

            let imageUrls = [];
            let videoUrls = [];

            if (req.files) {
                if (req.files.Image && req.files.Image.length > 0) {
                    imageUrls = req.files.Image.map(file => file.path);
                }
                if (req.files.Video && req.files.Video.length > 0) {
                    videoUrls = req.files.Video.map(file => file.path);
                }
            }

            const newPost = new Post({
                UserID,
                Content,
                Image: imageUrls,
                Video: videoUrls,
                Status,
            });

            const savedPost = await newPost.save();
            return res.status(200).json({
                message: 'Post created successfully',
                post: savedPost
            });

        } catch (err) {
            console.error('Error in createPost:', err);
            return res.status(500).json({ message: err.message || 'Server error', error: err });
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
            const { Content, Status, GroupID } = req.body;
            const post = await Post.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            if (post.UserID.toString() !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            // Check nếu status là group
            if (Status === 'group' && !GroupID) {
                return res.status(400).json({ message: 'GroupID is required when status is "group"' });
            }

            // Xử lý ảnh và video
            let newImageUrls = post.Image; // giữ ảnh cũ mặc định
            let newVideoUrls = post.Video;

            if (req.files) {
                if (req.files.Image && req.files.Image.length > 0) {
                    newImageUrls = req.files.Image.map(file => file.path);
                }
                if (req.files.Video && req.files.Video.length > 0) {
                    newVideoUrls = req.files.Video.map(file => file.path);
                }
            }

            // Gán lại dữ liệu
            post.Content = Content || post.Content;
            post.Status = Status || post.Status;
            post.GroupID = GroupID || post.GroupID;
            post.Image = newImageUrls;
            post.Video = newVideoUrls;

            const updatedPost = await post.save();
            return res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
        } catch (err) {
            console.error("Error in updatePost:", err);
            return res.status(500).json({ message: 'Server error' });
        }
    },


    getPosts: async (req, res) => {
        try {
            const offset = parseInt(req.query.offset) || 0;
            const limit = parseInt(req.query.limit) || 10;
            const userId = req.user.id;

            const posts = await Post.find({ Status: 'public' })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .populate('UserID', 'Name Avatar');

            const postIds = posts.map(post => post._id);

            const reactions = await Reaction.find({
                UserID: userId,
                PostID: { $in: postIds }
            });

            const reactionMap = {};
            reactions.forEach(r => {
                reactionMap[r.PostID.toString()] = r.Type;
            });

            const postsWithReaction = posts.map(post => {
                const postObj = post.toObject();
                postObj.CurrentUserReaction = reactionMap[post._id.toString()] || null;
                return postObj;
            });

            res.status(200).json(postsWithReaction);
        } catch (err) {
            console.error('Error in getPosts:', err);
            res.status(500).json({ message: 'Server error' });
        }
    },


    deletePost: async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            if (post.UserID.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            // Nếu bạn muốn xóa file thật trên server/cloud, xử lý thêm ở đây

            await Post.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Post deleted successfully' });
        } catch (err) {
            console.error('Delete error:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    getUserPosts: async (req, res) => {
        try {
            const offset = parseInt(req.query.offset) || 0;
            const limit = parseInt(req.query.limit) || 10;
            const userId = req.user.id;

            const posts = await Post.find({ UserID: userId })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .populate('UserID', 'Name Avatar');

            const postIds = posts.map(post => post._id);

            const reactions = await Reaction.find({
                UserID: userId,
                PostID: { $in: postIds }
            });

            const reactionMap = {};
            reactions.forEach(r => {
                reactionMap[r.PostID.toString()] = r.Type;
            });

            const postsWithReaction = posts.map(post => {
                const postObj = post.toObject();
                postObj.CurrentUserReaction = reactionMap[post._id.toString()] || null;
                return postObj;
            });

            res.status(200).json(postsWithReaction);
        } catch (err) {
            console.error('Error in getUserPosts:', err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getPostsByUserId: async (req, res) => {
        try {
            const userId = req.params.userId;
            const offset = parseInt(req.query.offset) || 0;
            const limit = parseInt(req.query.limit) || 10;

            const posts = await Post.find({ UserID: userId })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .populate('UserID', 'Name Avatar');

            const currentUserId = req.user.id;

            const postIds = posts.map(post => post._id);
            const reactions = await Reaction.find({
                UserID: currentUserId,
                PostID: { $in: postIds }
            });

            const reactionMap = {};
            reactions.forEach(r => {
                reactionMap[r.PostID.toString()] = r.Type;
            });

            const postsWithReaction = posts.map(post => {
                const postObj = post.toObject();
                postObj.CurrentUserReaction = reactionMap[post._id.toString()] || null;
                return postObj;
            });

            res.status(200).json(postsWithReaction);
        } catch (err) {
            console.error("Error in getPostsByUserId:", err);
            res.status(500).json({ message: 'Server error' });
        }
    }


};

module.exports = PostController;