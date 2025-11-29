const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require('./cronJobs/UpdatedDaily');
require('./cronJobs/RunRemind');
require('./cronJobs/SubscriptionCron');
require('./cronJobs/SubscriptionReminderJob');
require('./cronJobs/BookingAutoComplete');
require('./cronJobs/BookingAutoCheckIn');

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
const adminRoutes = require('./routes/Admin');
const BilliardsClubRoutes = require('./routes/BilliardsClub');
const BilliardsTableRoutes = require('./routes/BilliardsTable');
const TableRateRoutes = require('./routes/TableRate');
const billiardsBookingRoutes = require('./routes/BilliardsBooking');
const notificationRoutes = require('./routes/Notification');
const searchRoutes = require('./routes/Search');
const withdrawalRoutes = require('./routes/Withdrawal');


const redisClient = require('./redisClient');
const User = require('./models/User');
const applySocketMiddleware = require('./middlewares/socketMiddleware');

dotenv.config();

// Cấu hình origin cho frontend (dùng khi deploy)
// Chuẩn hoá để bỏ dấu '/' ở cuối (nếu có), vì header Origin của browser không có '/'
const RAW_FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NORMALIZED_FRONTEND_URL = RAW_FRONTEND_URL.replace(/\/$/, '');

const ALLOWED_ORIGINS = [
  NORMALIZED_FRONTEND_URL,   // Vercel frontend (prod)
  'http://localhost:3000',   // local dev
  'http://localhost:5173'    // local Vite (nếu có)
].filter(Boolean);

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
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Postman, server-to-server
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS error: Origin ${origin} not allowed`));
  },
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
app.use('/table-rate', TableRateRoutes);
app.use('/billiards-booking', billiardsBookingRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/search', searchRoutes);
app.use('/withdrawal', withdrawalRoutes);


// Tạo HTTP server
const server = http.createServer(app);

// Khởi tạo socket.io
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
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
    socket.join(`user:${userId}`);
    console.log(`🔔 User ${userId} joined notification room`);

    if (userDisconnectTimers.has(userId)) {
      clearTimeout(userDisconnectTimers.get(userId));
      userDisconnectTimers.delete(userId);
    }

    (async () => {
      try {
        await redisClient.setEx(`online:${userId}`, 60, 'true');
        console.log(`✅ User ${userId} is online (TTL: 60s)`);
        socket.broadcast.emit('user_online', userId);
        
        // Gửi danh sách online cho chính user đó
        const keys = await redisClient.keys('online:*');
        const onlineUserIds = keys.map(k => k.split(':')[1]);
        socket.emit('online_users', onlineUserIds);
      } catch (err) {
        console.error(`❌ Error setting user online status:`, err);
      }
    })();
  }

  if (socket.user?.role === 'admin') {
    socket.join('admins');
    console.log('👑 Admin connected, joined admins room');
  }

  socket.on('disconnect', () => {
    if (userId) {
      // Không xóa Redis key ngay lập tức
      // Key sẽ tự động expire sau 60 giây nếu không có heartbeat ping
      // Điều này cho phép user reconnect nhanh (reload page) mà không bị đánh dấu offline
      console.log(`🔌 User ${userId} disconnected. Key will expire in 60s if no heartbeat.`);
      
      // Cập nhật LastSeen sau một khoảng thời gian ngắn
      // (không cần xóa Redis key vì TTL sẽ tự động xử lý)
      const timer = setTimeout(async () => {
        const isStillOnline = await redisClient.get(`online:${userId}`);
        if (isStillOnline !== 'true') {
          // Key đã expire (không còn heartbeat), user thực sự offline
          await User.findByIdAndUpdate(userId, { LastSeen: new Date() });
          console.log(`❌ User ${userId} went offline (no heartbeat)`);
          io.emit('user_offline', userId);
        }
        userDisconnectTimers.delete(userId);
      }, 65000); // Chờ 65 giây để đảm bảo TTL đã expire

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

  // Matching socket events
  socket.on('join_matching', () => {
    if (userId) {
      socket.join(`matching:${userId}`);
      console.log(`User ${userId} joined matching room`);
    }
  });

  socket.on('leave_matching', () => {
    if (userId) {
      socket.leave(`matching:${userId}`);
      console.log(`User ${userId} left matching room`);
    }
  });

  // Booking socket events - join/leave club room for real-time updates
  socket.on('join_club_room', (clubId) => {
    if (clubId) {
      socket.join(`club:${clubId}`);
      console.log(`User ${userId} joined club room: club:${clubId}`);
    }
  });

  socket.on('leave_club_room', (clubId) => {
    if (clubId) {
      socket.leave(`club:${clubId}`);
      console.log(`User ${userId} left club room: club:${clubId}`);
    }
  });
});

// Gắn socket vào app
app.set('socketio', io);

// Khởi chạy server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
