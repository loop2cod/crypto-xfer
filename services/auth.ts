import { post } from '@/utilities/AxiosInterceptor';
import { authRateLimiter, registrationRateLimiter } from '@/utils/validation';

// Types
export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: any;
  message?: string;
  user?: any;
}

export interface VerificationRequest {
  email: string;
  verification_code: string;
}

export interface ResendVerificationRequest {
  email: string;
}


export interface RefreshTokenRequest {
  refresh_token: string;
}

// API endpoints
const AUTH_ENDPOINTS = {
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  SEND_VERIFICATION: '/api/v1/auth/send-verification',
  VERIFY_EMAIL: '/api/v1/auth/verify-email',
  SEND_PRE_REGISTRATION_CODE: '/api/v1/auth/send-pre-registration-code',
  VERIFY_PRE_REGISTRATION_CODE: '/api/v1/auth/verify-pre-registration-code',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
} as const;

// Auth service functions
export const authService = {
  async register(data: RegisterRequest): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      // Check rate limiting for registration
      const userKey = `register_${data.email}`;
      if (!registrationRateLimiter.isAllowed(userKey)) {
        const remainingTime = Math.ceil(registrationRateLimiter.getRemainingTime(userKey) / 1000 / 60);
        return {
          success: false,
          message: `Too many registration attempts. Please try again in ${remainingTime} minutes.`
        };
      }

      const response = await post<any>(AUTH_ENDPOINTS.REGISTER, data);
      return {
        success: true,
        message: 'Registration successful',
        user: response.user
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.detail || 'Registration failed'
      };
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Check rate limiting
      const userKey = `login_${data.email}`;
      if (!authRateLimiter.isAllowed(userKey)) {
        const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(userKey) / 1000);
        return {
          success: false,
          message: `Too many login attempts. Please try again in ${remainingTime} seconds.`,
          data: {
            access_token: '',
            refresh_token: '',
            token_type: ''
          }
        };
      }

      const response = await post<any>(AUTH_ENDPOINTS.LOGIN, data);
      
      return response
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.detail || 'Login failed',
        data: {
          access_token: '',
          refresh_token: '',
          token_type: ''
        }
      };
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await post<AuthResponse>(AUTH_ENDPOINTS.REFRESH, {
        refresh_token
      });

      // Update stored tokens and user data
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('token_type', response.data.token_type);
        
        // Update user data if available
        if (response.data.user) {
          localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
      }

      return response;
    } catch (error: any) {
      // Clear stored tokens on refresh failure
      this.logout();
      throw new Error(error?.response?.data?.detail || 'Token refresh failed');
    }
  },

  async sendVerificationCode(data: ResendVerificationRequest): Promise<{ message: string }> {
    try {
      const response = await post<{ message: string }>(AUTH_ENDPOINTS.SEND_VERIFICATION, data);
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to send verification code');
    }
  },

  async verifyEmail(data: VerificationRequest): Promise<AuthResponse> {
    try {
      const response = await post<AuthResponse>(AUTH_ENDPOINTS.VERIFY_EMAIL, data);
      
      // Store tokens and user data in localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('token_type', response.data.token_type);
        
        // Store user data if available
        if (response.data.user) {
          localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Email verification failed');
    }
  },

  async logout(): Promise<void> {
    try {
      // Call the logout endpoint to log the activity
      await post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with logout even if the API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user_data');
    }
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  getUserData(): any | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  },

  setUserData(userData: any): void {
    try {
      localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  },

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  },

  // Decode JWT token to get expiration (basic implementation)
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return true;

    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  async sendPreRegistrationCode(data: ResendVerificationRequest): Promise<{ success: boolean; message: string; email: string; expires_in_minutes: number }> {
    try {
      const response = await post<{ success: boolean; message: string; email: string; expires_in_minutes: number }>(
        AUTH_ENDPOINTS.SEND_PRE_REGISTRATION_CODE, 
        data
      );
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to send verification code');
    }
  },

  async verifyPreRegistrationCode(data: VerificationRequest): Promise<{ success: boolean; message: string; verified: boolean; email: string }> {
    try {
      const response = await post<{ success: boolean; message: string; verified: boolean; email: string }>(
        AUTH_ENDPOINTS.VERIFY_PRE_REGISTRATION_CODE, 
        data
      );
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Code verification failed');
    }
  },

  async forgotPassword(data: ResendVerificationRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await post<{ success: boolean; message: string }>(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
      return {
        success: true,
        message: response.message || 'Password reset link sent to your email'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.detail || 'Failed to send password reset link'
      };
    }
  }
};

export default authService;