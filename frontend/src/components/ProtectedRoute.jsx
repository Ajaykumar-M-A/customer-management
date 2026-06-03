import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-brand" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
