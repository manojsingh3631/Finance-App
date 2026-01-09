import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute render:', { isAuthenticated, isLoading, user: user?.name, path: location.pathname });
  }, [isAuthenticated, isLoading, user, location.pathname]);

  // Show loading while checking auth
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-500" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('Authenticated, rendering protected content');
  return children;
}