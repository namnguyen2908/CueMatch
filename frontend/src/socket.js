import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  withCredentials: true,
  autoConnect: false,
});

export const reconnectSocket = () => {
  socket.connect();
};

export default socket;