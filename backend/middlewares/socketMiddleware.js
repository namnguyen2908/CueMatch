// middlewares/socketMiddleware.js
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  io.use((socket, next) => {
  try {
    // Ưu tiên lấy token từ auth
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log('No token found in socket auth');
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.error('Socket middleware error:', err);
    next();
  }
});
};
