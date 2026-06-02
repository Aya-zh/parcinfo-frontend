import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    return token ? { token, email } : null;
  });
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifCount = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    api.get(`/api/notifications/utilisateur/${userId}`)
      .then(res => {
        const nonLues = res.data.filter(n => !n.lu).length;
        setNotifCount(nonLues);
      })
      .catch(() => setNotifCount(0));
  };

  useEffect(() => {
    if (user) {
      fetchNotifCount();
      const interval = setInterval(fetchNotifCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email, motDePasse) => {
    const response = await api.post('/api/auth/login', { email, motDePasse });
    const data = response.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', email);
    localStorage.setItem('role', data.role || '');
    localStorage.setItem('nom', data.nom || '');
    localStorage.setItem('prenom', data.prenom || '');
    localStorage.setItem('userId', data.id || '');
    setUser(data);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setNotifCount(0);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, notifCount, setNotifCount, fetchNotifCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}