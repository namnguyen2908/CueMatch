const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const userSocketMap = {}; // Lưu userId -> socket.id

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🟢 Socket connected:', socket.id);
        socket.on('init_user', (userId) => {
            userSocketMap[userId] = socket.id;
            console.log(`🧩 User ${userId} connected via socket ${socket.id}`);
        });
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`📥 Socket ${socket.id} joined conversation ${conversationId}`);
        });
        socket.on('send_message', async ({ ConversationId, SenderId, Text, Media = [] }) => {
            try {
                const message = await Message.create({
                    ConversationId,
                    Sender: SenderId,
                    Text,
                    Media,
                    ReadBy: [SenderId],
                });
                await Conversation.findByIdAndUpdate(ConversationId, {
                    LastMessage: message._id,
                    updatedAt: new Date(),
                });
                const conversation = await Conversation.findById(ConversationId).populate('Members', '_id');
                conversation.Members.forEach((member) => {
                    const receiverSocketId = userSocketMap[member._id.toString()];
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit('receive_message', message);
                    }
                });
            } catch (err) {
                console.error('❌ Error sending message:', err);
            }
        });
        socket.on('typing', ({ ConversationId, UserId }) => {
            socket.to(ConversationId).emit('user_typing', UserId);
        });

        socket.on('stop_typing', ({ ConversationId, UserId }) => {
            socket.to(ConversationId).emit('user_stop_typing', UserId);
        });
        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected:', socket.id);
            for (const userId in userSocketMap) {
                if (userSocketMap[userId] === socket.id) {
                    delete userSocketMap[userId];
                    console.log(`❎ User ${userId} disconnected`);
                    break;
                }
            }
        });
    });
};
