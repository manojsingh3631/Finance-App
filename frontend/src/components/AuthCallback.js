import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToken = urlParams.get('session_token');

      if (!sessionToken) {
        console.log('No session_token found, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        console.log('Processing session with sessionToken:', sessionToken);

        // Set the session token as a cookie (simulate what backend would do)
        document.cookie = `session_token=${sessionToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;

        // Get user data
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Session validation successful, user:', userData);

          // Set flag to indicate successful login
          sessionStorage.setItem('auth_just_completed', 'true');
          sessionStorage.setItem('user_data', JSON.stringify(userData));

          // Navigate to dashboard
          navigate('/dashboard', { replace: true });

          // Force a reload to ensure clean state
          window.location.reload();
        } else {
          console.error('Session exchange failed with status:', response.status);
          navigate('/login');
        }
      } catch (error) {
        console.error('Session exchange failed:', error);
        navigate('/login');
      }
    };

    processSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-500" />
        <p className="text-slate-400">Completing authentication...</p>
        <p className="text-slate-500 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}