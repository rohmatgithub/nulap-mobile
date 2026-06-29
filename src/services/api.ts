import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from './queryClient';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8686/api/v1';
const APP_ID = process.env.EXPO_PUBLIC_APP_ID || 'nulap-app';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': APP_ID,
  },
});

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshTokenResponse {
  status: {
    code: string;
    message: string;
    detail?: unknown;
  };
  data?: {
    accessToken: string;
  };
}

let refreshPromise: Promise<string | null> | null = null;

async function clearExpiredSession() {
  await useAuthStore.getState().clearAuth();
  queryClient.clear();
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync('refresh_token');
  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshTokenResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-App-Id': APP_ID,
          },
        }
      )
      .then(async (response) => {
        const accessToken = response.data.data?.accessToken;
        if (!accessToken || response.data.status?.code !== 'OK') {
          return null;
        }

        await SecureStore.setItemAsync('access_token', accessToken);
        useAuthStore.setState({ accessToken, isAuthenticated: true });
        return accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response wrapper type matching backend format
interface ApiResponse<T = unknown> {
  status: {
    code: string;
    message: string;
    detail?: unknown;
  };
  data?: T;
}

apiClient.interceptors.response.use(
  (response) => {
    // Backend returns { status: {...}, data: ... } format
    // Extract the nested data automatically
    const apiResponse = response.data as ApiResponse;
    if (apiResponse && typeof apiResponse === 'object' && 'status' in apiResponse) {
      if (apiResponse.status?.code === 'OK') {
        response.data = apiResponse.data;
      } else {
        // Non-OK status, treat as error
        return Promise.reject(new Error(apiResponse.status?.message || 'API Error'));
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const accessToken = await refreshAccessToken();
      if (accessToken) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      }

      await clearExpiredSession();
    } else if (error.response?.status === 401) {
      await clearExpiredSession();
    }
    return Promise.reject(error);
  }
);

export interface ApiError {
  message: string;
  status: number;
}

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
    };
  }
  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}
