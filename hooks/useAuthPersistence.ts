import { useEffect, useState } from 'react';
import AuthPersistence from '@/utils/auth-persistence';

/**
 * Hook for managing authentication persistence
 * This hook provides utilities for checking authentication status
 * and handling authentication state changes
 */
export function useAuthPersistence() {
  const [authState, setAuthState] = useState(() => AuthPersistence.getAuthState());

  useEffect(() => {
    // Update auth state when localStorage changes (multi-tab sync)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'access_token' || event.key === 'user_data') {
        setAuthState(AuthPersistence.getAuthState());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const refreshAuthState = () => {
    setAuthState(AuthPersistence.getAuthState());
  };

  const isAuthenticated = () => {
    return AuthPersistence.isAuthenticated();
  };

  return {
    ...authState,
    refreshAuthState,
    isAuthenticated,
  };
}

export default useAuthPersistence;