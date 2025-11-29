const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const MessageController = {

  sendMessage: async (req, res) => {
    const UserId = req.user.id;
    const { ConversationId, Text, ReceiverId, Type = 'single', Name } = req.body;
    const io = req.app.get('socketio');
    let conversationIdToUse = ConversationId;
    try {
      let conversation = null;
      if (!conversationIdToUse) {
        if (!ReceiverId && Type === 'single') {
          return res.status(400).json({ message: 'Missing ReceiverId for single chat' });
        }
        let members = [UserId];
        if (Type === 'single') {
          members.push(ReceiverId);
          members = [...new Set(members)];
          conversation = await Conversation.findOne({
            Type: 'single',
            Members: { $all: members, $size: members.length }
          });
        }
        if (!conversation) {
          conversation = await Conversation.create({
            Name: Type === 'group' ? Name || 'New group' : '',
            Type,
            Members: Type === 'single' ? members : [UserId],
            Admins: Type === 'group' ? [UserId] : [],
          });
        }
        conversationIdToUse = conversation._id;
      }
      const message = await Message.create({
        ConversationId: conversationIdToUse,
        Sender: UserId,
        Text: Text || '',
        ReadBy: [UserId],
      });

      await Conversation.findByIdAndUpdate(conversationIdToUse, {
        LastMessage: message._id,
        updatedAt: new Date(),
      });
      io.to(conversationIdToUse.toString()).emit('receive_message', message);
      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ message: 'Message sending failed', error: err.message });
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
      res.status(500).json({ message: 'Unable to retrieve message', error: err.message });
    }
  }
};

module.exports = MessageController;