const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const mongoose = require('mongoose');

const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

const ReactionController = {

    reactionToPost: async (req, res) => {
        try {
            const { PostID, Type } = req.body;
            const UserID = req.user.id;
            if (!REACTION_TYPES.includes(Type)) {
                return res.status(400).json({ message: "Invalid reaction type" });
            }
            const existingReaction = await Reaction.findOne({ UserID, PostID });
            if (existingReaction) {
                if (existingReaction.Type === Type) return res.status(200).json({ message: 'Reaction already exists', data: existingReaction });

                await Post.findByIdAndUpdate(PostID, {
                    $inc: {
                        [`ReactionCounts.${existingReaction.Type}`]: -1,
                        [`ReactionCounts.${Type}`]: 1
                    }
                });
                existingReaction.Type = Type;
                await existingReaction.save();
                return res.status(200).json({ message: 'Reaction updated', data: existingReaction });
            }
            else {
                // Tạo mới reaction
                const newReaction = new Reaction({ UserID, PostID, Type });
                await newReaction.save();
                await Post.findByIdAndUpdate(PostID, {
                    $inc: { [`ReactionCounts.${Type}`]: 1 }
                });

                return res.status(201).json({ message: 'Reaction added', data: newReaction });
            }

        } catch (err) {
            console.error("reaction to post: ", err);
            return res.status(500).json({ message: 'Server error' })
        }
    },

    deleteReaction: async (req, res) => {
        try {
            const { PostID } = req.body;
            const UserID = req.user.id;
            const reaction = await Reaction.findOneAndDelete({ UserID, PostID });
            if (!reaction) return res.status(404).json({ message: "Reaction not found" });
            await Post.findByIdAndUpdate(PostID, {
                $inc: { [`ReactionCounts.${reaction.Type}`]: -1 }
            });
            return res.status(200).json({ message: 'delete reaction' });
        } catch (err) {
            console.error("delete Reaction: ", err);
            return res.status(500).json({ message: "Server error" });
        }
    },

    getReactionsGroupedByType: async (req, res) => {
        try {
            const { postId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                return res.status(400).json({ message: "Invalid PostID" });
            }

            const reactions = await Reaction.find({ PostID: postId })
                .populate("UserID", "Name Avatar")
                .sort({ createdAt: -1 })
                .lean();

            if (!reactions.length) {
                return res.status(404).json({ message: "No reactions found" });
            }

            const grouped = {};

            // Group reactions by type
            reactions.forEach((reaction) => {
                const type = reaction.Type;
                if (!grouped[type]) {
                    grouped[type] = [];
                }
                grouped[type].push({
                    user: {
                        name: reaction.UserID?.Name || "Unknown",
                        avatar: reaction.UserID?.Avatar,
                    },
                    type: reaction.Type,
                    createdAt: reaction.createdAt,
                });
            });

            return res.status(200).json(grouped);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

}

module.exports = ReactionController;