import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { API_BASE_URL } from '../config/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('skvt_user');
        const sessionExpiry = localStorage.getItem('skvt_session_expiry');
        
        if (savedUser && sessionExpiry) {
          const expiryTime = parseInt(sessionExpiry);
          const currentTime = Date.now();
          
          // Check if session is still valid (24 hours)
          if (currentTime < expiryTime) {
            const user = JSON.parse(savedUser);
            setAuthState({
              user,
              isAuthenticated: true,
              loading: false,
            });
            return;
          } else {
            // Session expired, clear storage
            localStorage.removeItem('skvt_user');
            localStorage.removeItem('skvt_session_expiry');
          }
        }
        
        setAuthState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        console.error('Error checking existing session:', error);
        localStorage.removeItem('skvt_user');
        localStorage.removeItem('skvt_session_expiry');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      setError(null);
      
      // Call the actual login API
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Map the API response to our User interface
        const user: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: mapApiRoleToAppRole(data.user.role),
          departmentId: data.user.departmentId,
          isActive: data.user.isActive,
          createdAt: data.user.createdAt,
        };

        // Set session expiry to 24 hours from now
        const sessionExpiry = Date.now() + (24 * 60 * 60 * 1000);
        
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
        
        // Store user data and session expiry
        localStorage.setItem('skvt_user', JSON.stringify(user));
        localStorage.setItem('skvt_session_expiry', sessionExpiry.toString());
        
        return true;
      } else {
        // Handle API errors
        const errorMessage = data.error || 'Login failed. Please try again.';
        setError(errorMessage);
        setAuthState(prev => ({ ...prev, loading: false }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  // Map API role to our app role format
  const mapApiRoleToAppRole = (apiRole: string): 'super_admin' | 'department_admin' | 'control_room' => {
    switch (apiRole) {
      case 'SuperAdmin':
        return 'super_admin';
      case 'DepartmentAdmin':
        return 'department_admin';
      case 'ControlRoom':
        return 'control_room';
      default:
        return 'department_admin'; // Default fallback
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    setError(null);
    // Clear all session data
    localStorage.removeItem('skvt_user');
    localStorage.removeItem('skvt_session_expiry');
  };

  // Auto-refresh session periodically (every 30 minutes)
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const refreshInterval = setInterval(() => {
        const sessionExpiry = localStorage.getItem('skvt_session_expiry');
        if (sessionExpiry) {
          const expiryTime = parseInt(sessionExpiry);
          const currentTime = Date.now();
          const timeUntilExpiry = expiryTime - currentTime;
          
          // If less than 2 hours remaining, extend session
          if (timeUntilExpiry < (2 * 60 * 60 * 1000) && timeUntilExpiry > 0) {
            const newExpiry = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('skvt_session_expiry', newExpiry.toString());
          }
          
          // If session expired, logout
          if (timeUntilExpiry <= 0) {
            logout();
          }
        }
      }, 30 * 60 * 1000); // Check every 30 minutes
      
      return () => clearInterval(refreshInterval);
    }
  }, [authState.isAuthenticated, authState.user]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };