const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require('./cronJobs/UpdatedDaily');
require('./cronJobs/RunRemind');

const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/Auth');
const postRoutes = require('./routes/Post');
const userRoutes = require('./routes/User');
const commentRoutes = require('./routes/Comment');
const reactionRoutes = require('./routes/Reaction');
const messageRoutes = require('./routes/Message');
const friendRoutes = require('./routes/Friend');
const playerBioRoutes = require('./routes/PlayerBio');
const matchingRoutes = require('./routes/Matching');
const subscriptionPlan = require('./routes/SubscriptionPlan');
const savedPost = require('./routes/SavedPost');
const paymentRoutes = require('./routes/Payment');
const BilliardsClubRoutes = require('./routes/BilliardsClub');
const BilliardsTableRoutes = require('./routes/BilliardsTable');


const redisClient = require('./redisClient');
const User = require('./models/User');
const applySocketMiddleware = require('./middlewares/socketMiddleware');

dotenv.config();
const app = express();

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

const connectToMongo = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅ Connected to MongoDB");
};
connectToMongo();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/post', postRoutes);
app.use('/user', userRoutes);
app.use('/comment', commentRoutes);
app.use('/reaction', reactionRoutes);
app.use('/message', messageRoutes);
app.use('/friends', friendRoutes);
app.use('/playerBio', playerBioRoutes);
app.use('/matching', matchingRoutes);
app.use('/subscriptionPlan', subscriptionPlan);
app.use('/savedPost', savedPost);
app.use('/payment', paymentRoutes);
app.use('/billiard-club', BilliardsClubRoutes);
app.use('/billiard-table', BilliardsTableRoutes);


// Tạo HTTP server
const server = http.createServer(app);

// Khởi tạo socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ Gắn middleware socket trước khi lắng nghe connection
applySocketMiddleware(io);
const userDisconnectTimers = new Map();
// Bắt đầu xử lý socket sau khi middleware đã được gắn
io.on('connection', (socket) => {
  const userId = socket.user?.id; // đã được gắn từ middleware
  console.log('🔌 Socket connected. UserID:', userId);

  if (userId) {
    // Nếu user reconnect sớm (sau reload), hủy timeout cũ
    if (userDisconnectTimers.has(userId)) {
      clearTimeout(userDisconnectTimers.get(userId));
      userDisconnectTimers.delete(userId);
    }

    redisClient.set(`online:${userId}`, 'true');
    console.log(`✅ User ${userId} is online`);
    socket.broadcast.emit('user_online', userId);
    
    // Gửi danh sách online cho chính user đó
    (async () => {
      const keys = await redisClient.keys('online:*');
      const onlineUserIds = keys.map(k => k.split(':')[1]);
      socket.emit('online_users', onlineUserIds);
    })();
  }

  socket.on('disconnect', () => {
    if (userId) {
      // Đặt timeout chờ khoảng 5–10 giây trước khi thực sự xóa Redis
      const timer = setTimeout(async () => {
        await redisClient.del(`online:${userId}`);
        await User.findByIdAndUpdate(userId, { LastSeen: new Date() });
        console.log(`❌ User ${userId} went offline`);
        socket.broadcast.emit('user_offline', userId);
        userDisconnectTimers.delete(userId);
      }, 5000);

      userDisconnectTimers.set(userId, timer);
    }
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${userId} joined room: ${conversationId}`);
  });

  socket.on('send_message', (message) => {
    const conversationId = message.ConversationId;
    io.to(conversationId).emit('receive_message', message);
  });
});

// Gắn socket vào app
app.set('socketio', io);

// Khởi chạy server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
