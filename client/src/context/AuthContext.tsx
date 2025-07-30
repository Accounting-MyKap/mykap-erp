import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser as apiLogin } from '../services/apiService';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (credentials: any) => {
    const response = await apiLogin(credentials);
    if (response.success) {
      setUser(response.user);
      navigate('/dashboard'); // Redirige al dashboard al iniciar sesión
    } else {
      throw new Error(response.message);
    }
  };

  // La función de logout la implementaremos después
  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar nuestro contexto fácilmente
export function useAuth() {
  return useContext(AuthContext);
}