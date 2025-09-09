const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const http = require('http'); // Thêm
const { Server } = require('socket.io'); // Thêm

const authRoutes = require('./routes/Auth');
const postRoutes = require('./routes/Post');
const userRoutes = require('./routes/User');
const commentRoutes = require('./routes/Comment');
const reactionRoutes = require('./routes/Reaction');
const messageRoutes = require('./routes/Message');
const friendRoutes = require('./routes/Friend');
const playerBioRoutes = require('./routes/PlayerBio');


dotenv.config();
const app = express();

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

const connectToMongo = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");
};
connectToMongo();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

//Routes
app.use('/auth', authRoutes);
app.use('/post', postRoutes);
app.use('/user', userRoutes);
app.use('/comment', commentRoutes);
app.use('/reaction', reactionRoutes);
app.use('/message', messageRoutes);
app.use('/friends', friendRoutes);
app.use('/playerBio', playerBioRoutes);

// Tạo HTTP server dựa trên app express
const server = http.createServer(app);

// Tạo socket.io server, cấu hình cors nếu cần
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend address
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Lắng nghe kết nối socket
io.on('connection', (socket) => {
  console.log('🔌 New client connected', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  socket.on('send_message', (message) => {
    const conversationId = message.ConversationId;
    io.to(conversationId).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Gắn socket.io vào app để có thể lấy ở controller nếu cần
app.set('socketio', io);

// Thay đổi gọi listen
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});