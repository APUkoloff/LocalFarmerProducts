import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.is_blocked) return <Navigate to="/unauthorized" replace />;
  if (roles && !roles.includes(user.role) && !user.is_superuser) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
