const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const MessageController = {
  // Gửi tin nhắn mới
  sendMessage: async (req, res) => {
    const UserId = req.user.id;
    const { ConversationId, Text, ReceiverId, Type = 'single', Name } = req.body;
    const io = req.app.get('socketio');
    let conversationIdToUse = ConversationId;

    try {
      // Upload media nếu có
      let mediaUrls = [];
      if (req.files && req.files.length > 0) {
        mediaUrls = req.files.map(file => file.path);
      }

      // Nếu không có ConversationId thì tạo mới
      let conversation = null;

      if (!conversationIdToUse) {
        if (!ReceiverId && Type === 'single') {
          return res.status(400).json({ message: 'Thiếu ReceiverId cho chat đơn' });
        }

        let members = [UserId];
        if (Type === 'single') {
          members.push(ReceiverId);
          members = [...new Set(members)];

          // Tìm cuộc trò chuyện đơn đã có
          conversation = await Conversation.findOne({
            Type: 'single',
            Members: { $all: members, $size: members.length }
          });
        }

        // Nếu chưa có thì tạo mới
        if (!conversation) {
          conversation = await Conversation.create({
            Name: Type === 'group' ? Name || 'Nhóm mới' : '',
            Type,
            Members: Type === 'single' ? members : [UserId],
            Admins: Type === 'group' ? [UserId] : [],
          });
        }

        conversationIdToUse = conversation._id;
      }

      // Tạo tin nhắn mới
      const message = await Message.create({
        ConversationId: conversationIdToUse,
        Sender: UserId,
        Text: Text || '',
        Media: mediaUrls,
        ReadBy: [UserId],
      });

      await Conversation.findByIdAndUpdate(conversationIdToUse, {
        LastMessage: message._id,
        updatedAt: new Date(),
      });

      io.to(conversationIdToUse.toString()).emit('receive_message', message);

      res.status(201).json(message);

    } catch (err) {
      res.status(500).json({ message: 'Gửi tin nhắn thất bại', error: err.message });
    }
  },

  // Lấy danh sách tin nhắn trong một cuộc trò chuyện
  getMessages: async (req, res) => {
    const { ConversationId } = req.params;

    try {
      const messages = await Message.find({ ConversationId: ConversationId })  // viết hoa
        .sort({ createdAt: 1 })
        .populate('Sender', 'Name Avatar');  // cũng viết hoa

      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json({ message: 'Không lấy được tin nhắn', error: err.message });
    }
  }
};

module.exports = MessageController;