const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const userSocketMap = {}; // Lưu userId -> socket.id

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🟢 Socket connected:', socket.id);

        // Khi client gửi userId lên để gán với socket
        socket.on('init_user', (userId) => {
            userSocketMap[userId] = socket.id;
            console.log(`🧩 User ${userId} connected via socket ${socket.id}`);
        });

        // Khi user vào cuộc trò chuyện => dùng để xử lý typing, v.v...
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`📥 Socket ${socket.id} joined conversation ${conversationId}`);
        });

        // Khi user gửi tin nhắn
        socket.on('send_message', async ({ ConversationId, SenderId, Text, Media = [] }) => {
            try {
                // 1. Tạo tin nhắn mới
                const message = await Message.create({
                    ConversationId,
                    Sender: SenderId,
                    Text,
                    Media,
                    ReadBy: [SenderId],
                });

                // 2. Cập nhật lastMessage cho cuộc trò chuyện
                await Conversation.findByIdAndUpdate(ConversationId, {
                    LastMessage: message._id,
                    updatedAt: new Date(),
                });

                // 3. Gửi đến tất cả thành viên qua socketId
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

        // Người dùng đang gõ
        socket.on('typing', ({ ConversationId, UserId }) => {
            socket.to(ConversationId).emit('user_typing', UserId);
        });

        // Người dùng dừng gõ
        socket.on('stop_typing', ({ ConversationId, UserId }) => {
            socket.to(ConversationId).emit('user_stop_typing', UserId);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected:', socket.id);

            // Optional: Xóa user khỏi map
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
