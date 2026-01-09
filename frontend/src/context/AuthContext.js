import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = determined
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we just completed auth
    const authJustCompleted = sessionStorage.getItem('auth_just_completed');
    const storedUserData = sessionStorage.getItem('user_data');
    
    if (authJustCompleted === 'true' && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('Loading user from session storage:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        
        // Clear the flags
        sessionStorage.removeItem('auth_just_completed');
        sessionStorage.removeItem('user_data');
        return;
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }

    // Check if user data was passed from AuthCallback via location state
    if (location.state?.user) {
      console.log('Loading user from location state:', location.state.user);
      setUser(location.state.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Otherwise check for existing session
    checkAuth();
  }, [location.state]);

  const checkAuth = async () => {
    try {
      console.log('Checking auth with backend...');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Auth check successful:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('Auth check failed with status:', response.status);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};