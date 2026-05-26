import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    const nom = localStorage.getItem('nom');
    const prenom = localStorage.getItem('prenom');
    const userId = localStorage.getItem('userId');
    return token ? { token, email, role, nom, prenom, userId } : null;
  });

  const navigate = useNavigate();

  const login = async (email, motDePasse) => {
    const response = await api.post('/api/auth/login', { email, motDePasse });
    const { token, role, nom, prenom, id } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
    localStorage.setItem('nom', nom);
    localStorage.setItem('prenom', prenom);
    localStorage.setItem('userId', id);

    setUser({ token, email, role, nom, prenom, userId: id });

    if (role === 'ADMINISTRATEUR') navigate('/dashboard');
    else if (role === 'RESPONSABLE') navigate('/dashboard');
    else if (role === 'TECHNICIEN') navigate('/dashboard/technicien');
    else if (role === 'BENEFICIAIRE') navigate('/dashboard/beneficiaire');
    else navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('nom');
    localStorage.removeItem('prenom');
    localStorage.removeItem('userId');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}