import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [datauser, setDataUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setDataUser(JSON.parse(storedUser));
  }, []);

  const Datalogin = (userData, token) => {
    setDataUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // 👇 Optional: lưu refreshToken nếu backend trả về
    // localStorage.setItem('refreshToken', refreshToken);
  };

  const logout = () => {
    setDataUser(null);
    localStorage.removeItem('user');
    // localStorage.removeItem('refreshToken');
  };

  return (
    <UserContext.Provider value={{ datauser, Datalogin, logout }}>
      {children}
    </UserContext.Provider>
  );
};
