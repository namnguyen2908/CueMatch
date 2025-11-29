import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  withCredentials: true,
  autoConnect: false,
  reconnection: true, // Tự động reconnect khi mất kết nối
  reconnectionDelay: 1000, // Đợi 1 giây trước khi reconnect
  reconnectionDelayMax: 5000, // Tối đa 5 giây giữa các lần reconnect
  reconnectionAttempts: Infinity, // Thử reconnect vô hạn
});

export const reconnectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export default socket;