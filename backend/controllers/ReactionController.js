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
            if (!reaction) return res.status(404).json({message: "Reaction not found"});
            await Post.findByIdAndUpdate(PostID, {
                $inc: { [`ReactionCounts.${reaction.Type}`] : -1 }
            });
            return res.status(200).json({message: 'delete reaction'});
        } catch (err) {
            console.error("delete Reaction: ", err);
            return res.status(500).json({message: "Server error"});
        }
    }
}

module.exports = ReactionController;