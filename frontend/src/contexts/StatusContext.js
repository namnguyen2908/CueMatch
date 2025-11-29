import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../socket';
import { useUser } from './UserContext';

const StatusContext = createContext();
export const useOnlineStatus = () => useContext(StatusContext);

export const OnlineStatusProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { datauser } = useUser();

  useEffect(() => {
    if (!datauser?.id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
    };

    const handleConnect = () => {
      console.log('Socket connected for online status');
    };

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
    };

    const handleReconnect = () => {
      console.log('Socket reconnected for online status');
    };

    const handleOnlineUsers = (ids) => {
      setOnlineUsers(new Set(ids));
    };

    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('online_users', handleOnlineUsers);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('online_users', handleOnlineUsers);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [datauser?.id]);

  return (
    <StatusContext.Provider value={{ onlineUsers }}>
      {children}
    </StatusContext.Provider>
  );
};
