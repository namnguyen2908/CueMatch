import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import userApi from '../api/userApi';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [datauser, setDataUser] = useState(null);
  const heartbeatIntervalRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setDataUser(JSON.parse(storedUser));
  }, []);

  // Heartbeat ping để renew TTL trong Redis khi user đã đăng nhập
  useEffect(() => {
    if (!datauser) {
      // Nếu user chưa đăng nhập, dừng heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      return;
    }

    const sendHeartbeat = async () => {
      try {
        await userApi.heartbeat();
      } catch (err) {
        // Silently fail - không hiển thị lỗi nếu heartbeat thất bại
        // (có thể do user đã logout hoặc token hết hạn)
        console.error("Heartbeat error:", err);
      }
    };

    // Gửi heartbeat ngay khi user đăng nhập
    sendHeartbeat();

    // Thiết lập interval: random 30-50 giây để tránh tất cả client ping cùng lúc
    const intervalMs = Math.floor(Math.random() * 20000) + 30000; // 30000-50000ms
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, intervalMs);

    // Cleanup khi user logout hoặc component unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [datauser]);

  const Datalogin = (userData, token) => {
    setDataUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // Dừng heartbeat khi logout
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    setDataUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ datauser, Datalogin, logout }}>
      {children}
    </UserContext.Provider>
  );
};
