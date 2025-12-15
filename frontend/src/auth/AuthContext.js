import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const localData = localStorage.getItem('cuidador');
    const sessionData = sessionStorage.getItem('cuidador');
    const data = localData || sessionData;
    return data ? JSON.parse(data) : null;
  });

  const login = (data, token, rememberMe = false) => {
    setUser(data);
    
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem('cuidador', JSON.stringify(data));
    if (token) storage.setItem('token', token); 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cuidador');
    localStorage.removeItem('token');
    sessionStorage.removeItem('cuidador');
    sessionStorage.removeItem('token');              
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    if (localStorage.getItem('cuidador')) {
        localStorage.setItem('cuidador', JSON.stringify(newUserData));
    } else {
        sessionStorage.setItem('cuidador', JSON.stringify(newUserData));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}