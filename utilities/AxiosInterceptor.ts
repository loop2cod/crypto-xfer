import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const API_URL = "http://localhost:8000"

const axiosApi = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include auth token
axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to refresh the token
const refreshTokenApi = async () => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      console.log("No refresh token available");
      throw new Error("No refresh token available");
    }

    console.log("Attempting to refresh token...");
    const response = await axiosApi.post(`/api/v1/auth/refresh`, {
      refresh_token
    });

    console.log("Refresh response:", response.data);

    // Backend returns data wrapped in BaseResponse format
    if (response?.data?.success && response?.data?.data?.access_token) {
      const tokenData = response.data.data;
      localStorage.setItem('access_token', tokenData.access_token);
      localStorage.setItem('refresh_token', tokenData.refresh_token);
      localStorage.setItem('token_type', tokenData.token_type);
      console.log("Token refreshed successfully");
      return true;
    } else {
      console.log("Token refresh failed - invalid response format");
      throw new Error("Token refresh failed");
    }
  } catch (error) {
    // Clear tokens and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    
    Cookies.set(
      "toastMessage",
      JSON.stringify({
        message: "Your session has expired.",
        description: "Please log in again.",
      }),
      { expires: 1 }
    );

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    throw error;
  }
};

// Axios response interceptor to handle token refresh on 401 errors
axiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      originalRequest._retry = true;

      try {
        const success = await refreshTokenApi();
        if (success) {
          // Update the original request with the new token
          const newToken = localStorage.getItem('access_token');
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosApi(originalRequest);
        } else {
          throw error;
        }
      } catch (refreshError) {
        console.error("Refresh Token Error:", refreshError);
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);



// Helper functions for HTTP methods
export async function get<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axiosApi.get<T>(url, { ...config });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response || error.response.status !== 401) {
      console.error("GET Request Error:", error);
    }
    throw error;
  }
}

export async function post<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axiosApi.post<T>(url, data, { ...config });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response || error.response.status !== 401) {
      console.error("POST Request Error:", error);
    }
    throw error;
  }
}

export async function put<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axiosApi.put<T>(url, data, { ...config });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response || error.response.status !== 401) {
      console.error("PUT Request Error:", error);
    }
    throw error;
  }
}

// New delete function (named 'del' to match your original)
export async function del<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axiosApi.delete<T>(url, { ...config });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response || error.response.status !== 401) {
      console.error("DELETE Request Error:", error);
    }
    throw error;
  }
}

// New patch function
export async function patch<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axiosApi.patch<T>(url, data, { ...config });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response || error.response.status !== 401) {
      console.error("PATCH Request Error:", error);
    }
    throw error;
  }
}

export default axiosApi;