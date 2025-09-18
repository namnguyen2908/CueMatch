import { io } from 'socket.io-client';

// Lấy token từ localStorage (hoặc cookie nếu bạn muốn)
const getToken = () => {
  return localStorage.getItem('accessToken'); // hoặc dùng cookie
};

const socket = io('http://localhost:8000', {
  withCredentials: true,
  autoConnect: false,
  auth: {
    token: getToken(), // <-- Thêm dòng này
  },
});

export const reconnectSocket = () => {
  const token = getToken();
  console.log("🔄 Reconnecting socket with token:", token);
  if (token) {
    socket.auth = { token };
    socket.connect();
  } else {
    console.warn("⚠️ No accessToken found, cannot reconnect socket");
  }
};

export default socket;
