import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [datauser, setDataUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    if (storedUser) setDataUser(JSON.parse(storedUser));
    if (storedToken) setAccessToken(storedToken);
  }, []);

  const Datalogin = (userData, token) => {
    setDataUser(userData);
    setAccessToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', token);
    // 👇 Optional: lưu refreshToken nếu backend trả về
    // localStorage.setItem('refreshToken', refreshToken);
  };

  const logout = () => {
    setDataUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    // localStorage.removeItem('refreshToken');
  };

  return (
    <UserContext.Provider value={{ datauser, accessToken, Datalogin, logout }}>
      {children}
    </UserContext.Provider>
  );
};
