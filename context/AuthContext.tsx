"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth';
import AuthPersistence from '@/utils/auth-persistence';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  logout: () => void;
  clearError: () => void;
  checkAuth: () => boolean;
  setAuthenticated: (user?: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });


  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => {
    setError(null);
  };

  const checkAuth = (): boolean => {
    try {
      const isAuth = authService.isAuthenticated();
      const token = authService.getAccessToken();
      const userData = authService.getUserData();
      
      if (isAuth && token && !authService.isTokenExpired(token)) {
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: true,
          user: userData,
          isLoading: false 
        }));
        return true;
      } else {
        authService.logout();
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.logout();
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }));
      return false;
    }
  };

  const logout = () => {
    AuthPersistence.handleLogout();
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      error: null,
    }));
  };

  const setAuthenticated = (user?: any) => {
    AuthPersistence.handleAuthSuccess(user);
    setState(prev => ({
      ...prev,
      user: user || null,
      isAuthenticated: true,
      error: null,
    }));
  };

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize AuthPersistence (sets up token refresh and storage listeners)
        AuthPersistence.initialize();
        
        // Restore authentication state
        const { isAuthenticated, user } = await AuthPersistence.restoreAuthState();
        
        setState(prev => ({
          ...prev,
          isAuthenticated,
          user,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          isLoading: false,
        }));
      }
    };

    initAuth();
    
    // Cleanup on unmount
    return () => {
      AuthPersistence.cleanup();
    };
  }, []);



  const contextValue: AuthContextType = {
    ...state,
    logout,
    clearError,
    checkAuth,
    setAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};