const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');

const ConversationController = {
    // Tạo cuộc trò chuyện mới (single hoặc group)
    createConversation: async (req, res) => {
        const { MemberIds, Type, Name } = req.body;
        const UserId = req.user.id;

        if (!MemberIds || MemberIds.length < 1) {
            return res.status(400).json({ message: 'Invalid member list' });
        }

        try {
            const Members = [...new Set([...MemberIds, UserId])];

            // Nếu là chat đơn thì kiểm tra trùng
            if (Type === 'single') {
                const existingConversation = await Conversation.findOne({
                    Type: 'single',
                    Members: { $all: Members, $size: Members.length },
                });

                if (existingConversation) {
                    return res.status(200).json(existingConversation);
                }
            }

            const conversation = await Conversation.create({
                Name: Type === 'group' ? Name : '',
                Type,
                Members,
                Admins: Type === 'group' ? [UserId] : [],
            });

            res.status(201).json(conversation);
        } catch (err) {
            res.status(500).json({ message: 'Create failed conversation', error: err.message });
        }
    },

    // Lấy danh sách cuộc trò chuyện của người dùng
    getUserConversations: async (req, res) => {
        const UserId = req.user.id;

        try {
            const conversations = await Conversation.find({ Members: UserId })
                .populate('Members', 'Name Avatar')
                .populate('LastMessage')
                .sort({ updatedAt: -1 });

            res.status(200).json(conversations);
        } catch (err) {
            res.status(500).json({ message: 'Unable to get conversation list', error: err.message });
        }
    }
};

module.exports = ConversationController;