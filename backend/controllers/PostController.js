const Post = require('../models/Post');
const User = require('../models/User');
const Reaction = require('../models/Reaction');
const { queueDashboardUpdate } = require('../services/adminDashboardService');
const mongoose = require('mongoose');

const PostController = {
    createPost: async (req, res) => {
        try {
            const { Content, Status } = req.body;
            const UserID = req.user?.id;

            if (!UserID) {
                return res.status(400).json({ message: 'UserID is required' });
            }

            // Validate Content: must not be empty
            if (!Content || Content.trim().length === 0) {
                return res.status(400).json({ message: 'Content cannot be empty' });
            }

            // Validate Content length: max 5000 characters
            if (Content.length > 5000) {
                return res.status(400).json({ message: 'Content must not exceed 5000 characters' });
            }

            // Validate Status: must be 'public' or 'friends'
            const allowedStatuses = ['public', 'friends'];
            if (Status && !allowedStatuses.includes(Status)) {
                return res.status(400).json({ message: 'Status must be either "public" or "friends"' });
            }

            let imageUrls = [];
            let videoUrls = [];

            if (req.files) {
                // Validate image file sizes (max 10MB each)
                if (req.files.Image && req.files.Image.length > 0) {
                    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
                    const oversizedImages = req.files.Image.filter(file => file.size > MAX_IMAGE_SIZE);
                    if (oversizedImages.length > 0) {
                        return res.status(400).json({ 
                            message: `Image file size must be less than 10MB. ${oversizedImages.length} image(s) exceeded the limit.` 
                        });
                    }
                    imageUrls = req.files.Image.map(file => file.path);
                }
                
                // Validate video file sizes (max 100MB each)
                if (req.files.Video && req.files.Video.length > 0) {
                    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
                    const oversizedVideos = req.files.Video.filter(file => file.size > MAX_VIDEO_SIZE);
                    if (oversizedVideos.length > 0) {
                        return res.status(400).json({ 
                            message: `Video file size must be less than 100MB. ${oversizedVideos.length} video(s) exceeded the limit.` 
                        });
                    }
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
            queueDashboardUpdate(req.app);
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
            const { id } = req.params;
            
            // Validate ID format
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid post ID format' });
            }

            const post = await Post.findById(id).populate('UserID', 'Name Avatar');
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
            const { id } = req.params;
            const { Content, Status, GroupID } = req.body;
            
            // Validate ID format
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid post ID format' });
            }

            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            if (post.UserID.toString() !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            // Validate Content if provided: must not be empty
            if (Content !== undefined) {
                if (!Content || Content.trim().length === 0) {
                    return res.status(400).json({ message: 'Content cannot be empty' });
                }
                // Validate Content length: max 5000 characters
                if (Content.length > 5000) {
                    return res.status(400).json({ message: 'Content must not exceed 5000 characters' });
                }
            }

            // Validate Status: must be 'public' or 'friends'
            const allowedStatuses = ['public', 'friends'];
            if (Status && !allowedStatuses.includes(Status)) {
                return res.status(400).json({ message: 'Status must be either "public" or "friends"' });
            }

            // Check nếu status là group
            if (Status === 'group' && !GroupID) {
                return res.status(400).json({ message: 'GroupID is required when status is "group"' });
            }

            // Xử lý ảnh và video
            let newImageUrls = post.Image; // giữ ảnh cũ mặc định
            let newVideoUrls = post.Video;

            if (req.files) {
                // Validate image file sizes (max 10MB each)
                if (req.files.Image && req.files.Image.length > 0) {
                    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
                    const oversizedImages = req.files.Image.filter(file => file.size > MAX_IMAGE_SIZE);
                    if (oversizedImages.length > 0) {
                        return res.status(400).json({ 
                            message: `Image file size must be less than 10MB. ${oversizedImages.length} image(s) exceeded the limit.` 
                        });
                    }
                    newImageUrls = req.files.Image.map(file => file.path);
                }
                
                // Validate video file sizes (max 100MB each)
                if (req.files.Video && req.files.Video.length > 0) {
                    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
                    const oversizedVideos = req.files.Video.filter(file => file.size > MAX_VIDEO_SIZE);
                    if (oversizedVideos.length > 0) {
                        return res.status(400).json({ 
                            message: `Video file size must be less than 100MB. ${oversizedVideos.length} video(s) exceeded the limit.` 
                        });
                    }
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
            
            // Validate offset and limit
            if (isNaN(offset) || offset < 0) {
                return res.status(400).json({ message: 'Offset must be a non-negative number' });
            }
            if (isNaN(limit) || limit < 1 || limit > 100) {
                return res.status(400).json({ message: 'Limit must be a number between 1 and 100' });
            }
            
            const userId = req.user.id;

            // Get friend IDs for privacy filtering
            const currentUser = await User.findById(userId).select('Friends');
            const friendIds = new Set((currentUser?.Friends || []).map(id => id.toString()));

            const posts = await Post.find({
                $or: [
                    { Status: 'public' },
                    {
                        Status: 'friends',
                        UserID: { $in: [userId, ...Array.from(friendIds)] }
                    }
                ]
            })
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
            const { id } = req.params;
            
            // Validate ID format
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid post ID format' });
            }

            const post = await Post.findById(id);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            if (post.UserID.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            // Nếu bạn muốn xóa file thật trên server/cloud, xử lý thêm ở đây

            await Post.findByIdAndDelete(id);
            queueDashboardUpdate(req.app);
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
            
            // Validate offset and limit
            if (isNaN(offset) || offset < 0) {
                return res.status(400).json({ message: 'Offset must be a non-negative number' });
            }
            if (isNaN(limit) || limit < 1 || limit > 100) {
                return res.status(400).json({ message: 'Limit must be a number between 1 and 100' });
            }
            
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
            
            // Validate userId format
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            const offset = parseInt(req.query.offset) || 0;
            const limit = parseInt(req.query.limit) || 10;
            
            // Validate offset and limit
            if (isNaN(offset) || offset < 0) {
                return res.status(400).json({ message: 'Offset must be a non-negative number' });
            }
            if (isNaN(limit) || limit < 1 || limit > 100) {
                return res.status(400).json({ message: 'Limit must be a number between 1 and 100' });
            }

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