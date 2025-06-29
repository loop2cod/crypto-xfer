import authService from '@/services/auth';

/**
 * Utility functions for handling authentication persistence
 */
export class AuthPersistence {
  private static tokenRefreshTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize authentication persistence
   * This should be called when the app starts
   */
  static initialize() {
    // Set up automatic token refresh
    this.setupTokenRefresh();
    
    // Listen for storage changes (for multi-tab synchronization)
    this.setupStorageListener();
  }

  /**
   * Set up automatic token refresh before expiration
   */
  private static setupTokenRefresh() {
    const scheduleRefresh = () => {
      const token = authService.getAccessToken();
      if (!token || authService.isTokenExpired(token)) {
        return;
      }

      try {
        // Decode token to get expiration time
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        
        // Refresh token 5 minutes before expiration
        const refreshTime = Math.max(timeUntilExpiration - 5 * 60 * 1000, 0);

        if (this.tokenRefreshTimer) {
          clearTimeout(this.tokenRefreshTimer);
        }

        this.tokenRefreshTimer = setTimeout(async () => {
          try {
            await authService.refreshToken();
            // Schedule next refresh
            scheduleRefresh();
          } catch (error) {
            console.error('Automatic token refresh failed:', error);
            // Token refresh failed, user needs to log in again
            authService.logout();
            window.location.reload();
          }
        }, refreshTime);
      } catch (error) {
        console.error('Error scheduling token refresh:', error);
      }
    };

    scheduleRefresh();
  }

  /**
   * Set up storage listener for multi-tab synchronization
   */
  private static setupStorageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event) => {
      // If authentication tokens are removed in another tab, reload this tab
      if (event.key === 'access_token' && !event.newValue) {
        window.location.reload();
      }
      
      // If new authentication tokens are added in another tab, reload this tab
      if (event.key === 'access_token' && event.newValue && !event.oldValue) {
        window.location.reload();
      }
    });
  }

  /**
   * Clean up timers and listeners
   */
  static cleanup() {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Check if user is authenticated and tokens are valid
   */
  static isAuthenticated(): boolean {
    const token = authService.getAccessToken();
    return !!(token && !authService.isTokenExpired(token));
  }

  /**
   * Get authentication status with user data
   */
  static getAuthState(): { isAuthenticated: boolean; user: any | null; token: string | null } {
    const token = authService.getAccessToken();
    const user = authService.getUserData();
    const isAuthenticated = !!(token && !authService.isTokenExpired(token));

    return {
      isAuthenticated,
      user: isAuthenticated ? user : null,
      token: isAuthenticated ? token : null
    };
  }

  /**
   * Restore authentication state from localStorage
   */
  static async restoreAuthState(): Promise<{ isAuthenticated: boolean; user: any | null }> {
    try {
      const token = authService.getAccessToken();
      const refreshToken = authService.getRefreshToken();
      const userData = authService.getUserData();

      if (!token) {
        console.log('[restoreAuthState] No token found. Returning unauthenticated.');
        return { isAuthenticated: false, user: null };
      }

      if (!authService.isTokenExpired(token)) {
        // Token is valid, restore authentication state
        this.setupTokenRefresh(); // Restart token refresh timer
        console.log('[restoreAuthState] Token valid. Returning authenticated.');
        return { isAuthenticated: true, user: userData };
      }

      if (refreshToken) {
        // Token is expired but we have a refresh token, try to refresh
        try {
          const response = await authService.refreshToken();
          this.setupTokenRefresh(); // Setup token refresh timer
          console.log('[restoreAuthState] Token refreshed. Returning authenticated.');
          return { isAuthenticated: true, user: response.user || userData };
        } catch (error) {
          console.error('Token refresh failed during restoration:', error);
          authService.logout();
          return { isAuthenticated: false, user: null };
        }
      }

      // No valid token or refresh token
      authService.logout();
      console.log('[restoreAuthState] No valid token or refresh token. Returning unauthenticated.');
      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.error('Error restoring authentication state:', error);
      authService.logout();
      return { isAuthenticated: false, user: null };
    }
  }

  /**
   * Handle successful authentication (login/signup)
   */
  static handleAuthSuccess(userData?: any) {
    if (userData) {
      authService.setUserData(userData);
    }
    this.setupTokenRefresh(); // Start token refresh timer
  }

  /**
   * Handle logout
   */
  static handleLogout() {
    this.cleanup();
    authService.logout();
  }
}

export default AuthPersistence;