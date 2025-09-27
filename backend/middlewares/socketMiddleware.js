const cookie = require('cookie');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  io.use((socket, next) => {
    try {
      // Ưu tiên lấy token từ auth (nếu có)
      let token = socket.handshake.auth?.token;

      // Nếu không có, lấy từ cookie
      if (!token && socket.handshake.headers.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies.accessToken;
      }

      if (!token) {
        console.log('❌ No token found in auth or cookie');
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error('❌ Socket middleware error:', err);
      next(new Error("Unauthorized"));
    }
  });
};
