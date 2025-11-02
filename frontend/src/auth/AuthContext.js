// src/auth/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const data = localStorage.getItem('cuidador');
    return data ? JSON.parse(data) : null;
  });

  const login = (data, token) => {
    setUser(data);
    localStorage.setItem('cuidador', JSON.stringify(data));
    if (token) localStorage.setItem('token', token); 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cuidador');
    localStorage.removeItem('token');              
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('cuidador', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
