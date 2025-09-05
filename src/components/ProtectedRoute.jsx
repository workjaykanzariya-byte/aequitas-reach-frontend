import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, bootstrapped } = useAuth();
  if (!bootstrapped) return null; // could be a loader
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/403" replace />;
  return children;
}
