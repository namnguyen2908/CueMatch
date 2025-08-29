const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const MessageController = {
  // Gửi tin nhắn mới
  sendMessage: async (req, res) => {
    const UserId = req.user.id;
    const { ConversationId, Text } = req.body;
    const io = req.app.get('socketio');
    try {
      // Nếu có file gửi kèm thì multer đã upload lên cloudinary và gắn vào req.files
      let mediaUrls = [];

      if (req.files && req.files.length > 0) {
        mediaUrls = req.files.map(file => file.path); // file.path = URL từ cloudinary
      }

      const message = await Message.create({
        ConversationId: ConversationId,
        Sender: UserId,
        Text: Text || '',
        Media: mediaUrls,
        ReadBy: [UserId],
      });

      await Conversation.findByIdAndUpdate(ConversationId, {
        LastMessage: message._id,
        updatedAt: new Date(),
      });

      io.to(ConversationId).emit('receive_message', message);

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