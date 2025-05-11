// "use client"

// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useRouter } from 'next/navigation';
// import { authService } from '@/services/authService';
// import { AuthFormData } from '@/lib/types';
// import { toast } from 'sonner';

// interface AuthContextType {
//   user: any | null;
//   isLoading: boolean;
//   login: (data: AuthFormData) => Promise<void>;
//   register: (data: AuthFormData) => Promise<void>;
//   logout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<any | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     // Check if user is already logged in on initial load
//     const initAuth = async () => {
//       const currentUser = authService.getCurrentUser();
//       if (currentUser) {
//         setUser(currentUser);
//       }
//       setIsInitialized(true);
//     };

//     initAuth();
//   }, []);

//   const login = async (data: AuthFormData) => {
//     setIsLoading(true);
//     try {
//       const result = await authService.login(data);
//       setUser(result.user);
//       toast.success('Signed in successfully!');
//       router.push('/');
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to sign in');
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const register = async (data: AuthFormData) => {
//     setIsLoading(true);
//     try {
//       await authService.register(data);
//       toast.success('Registration successful! Please sign in.');
//       return;
//     } catch (error: any) {
//       toast.error(error.message || 'Registration failed');
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = async () => {
//     setIsLoading(true);
//     try {
//       await authService.logout();
//       setUser(null);
//       toast.success('Logged out successfully');
//       router.push('/auth');
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to logout');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const value = {
//     user,
//     isLoading,
//     login,
//     register,
//     logout
//   };

//   // Show loading state until we've checked if the user is logged in
//   if (!isInitialized) {
//     return null;
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Define the auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  user: any | null;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUserData: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  user: null,
  login: async () => ({}),
  register: async () => ({}),
  logout: async () => {},
  refreshUserData: () => {},
});

// Auth provider props
interface AuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectToLogin?: boolean;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  requireAuth = false,
  redirectToLogin = true 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const router = useRouter();

  // Check auth status on mount and when localStorage changes
  const checkAuthStatus = () => {
    const isLoggedIn = authService.isLoggedIn();
    const currentUserId = authService.getCurrentUserId();
    const currentUser = authService.getCurrentUser();
    
    console.log('Auth check - isLoggedIn:', isLoggedIn, 'userId:', currentUserId);
    
    setIsAuthenticated(isLoggedIn);
    setUserId(currentUserId);
    setUser(currentUser);
    setIsLoading(false);
    setIsInitialized(true);
    
    // Handle redirect if needed
    if (requireAuth && !isLoggedIn && redirectToLogin) {
      router.push('/auth');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUserId(null);
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/auth');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUserData = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  // Handle login
  const handleLogin = async (credentials: any) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      checkAuthStatus();
      toast.success('Signed in successfully!');
      router.push('/');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      setIsLoading(false);
      throw error;
    }
  };

  // Handle registration
  const handleRegister = async (userData: any) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      toast.success('Registration successful! Please sign in.');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      setIsLoading(false);
      throw error;
    }
  };

  // Set up listeners for auth changes
  useEffect(() => {
    // Initial check
    checkAuthStatus();
    
    // Set up storage event listener to detect auth changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'sb-auth-token' || event.key === 'sb-user-data') {
        checkAuthStatus();
      }
    };
    
    // Add listener
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userId,
        user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUserData,
      }}
    >
      {(!requireAuth || isAuthenticated || isLoading) && isInitialized ? children : null}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC to protect routes that require authentication
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithAuth: React.FC<P> = (props) => {
    return (
      <AuthProvider requireAuth={true}>
        <Component {...props} />
      </AuthProvider>
    );
  };
  
  return WithAuth;
};