import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
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

  // Mock users for demonstration
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'SKVT Super Admin',
      email: 'admin@skvt.org',
      phone: '+91-9876543210',
      role: 'super_admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Security Department Admin',
      email: 'security@skvt.org',
      phone: '+91-9876543211',
      role: 'department_admin',
      departmentId: 'dept-1',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'पुलिस आयुक्त Admin',
      email: 'policecom@gmail.com',
      phone: '+91-9876543220',
      role: 'department_admin',
      departmentId: 'dept-1',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Control Room Operator',
      email: 'control@skvt.org',
      phone: '+91-9876543212',
      role: 'control_room',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

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
      
      // Mock authentication - in real app, this would be an API call
      const user = mockUsers.find(u => u.email === email);
      
      if (user && (password === 'skvt123' || password === 'user@123')) {
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
      }
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };