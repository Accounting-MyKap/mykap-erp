import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth(); // Leemos el usuario de nuestro contexto
  
  // Si hay un usuario, muestra el contenido. Si no, redirige al login.
  return user ? <Outlet /> : <Navigate to="/login" />;
}