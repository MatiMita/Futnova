import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rol } from '../types';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  roles?: Rol[];
}

const ProtectedRoute = ({ children, roles }: Props) => {
  const { user, perfil, loading } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && perfil && !roles.includes(perfil.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
