// src/context/StatusContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../socket'; // import socket đã cấu hình

const StatusContext = createContext();

export const useOnlineStatus = () => useContext(StatusContext);

export const OnlineStatusProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Nhận danh sách người đang online khi vừa kết nối
    socket.on('online_users', (ids) => {
      setOnlineUsers(new Set(ids));
    });

    // Khi có người online mới
    socket.on('user_online', (userId) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    // Khi có người offline
    socket.on('user_offline', (userId) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    return () => {
      socket.off('online_users');
      socket.off('user_online');
      socket.off('user_offline');
      socket.disconnect(); // ngắt kết nối khi context unmount
    };
  }, []);

  return (
    <StatusContext.Provider value={{ onlineUsers }}>
      {children}
    </StatusContext.Provider>
  );
};