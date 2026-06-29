import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8686/api/v1';
const APP_ID = process.env.EXPO_PUBLIC_APP_ID || 'nulap-app';

interface LoginResponse {
  status: {
    success: boolean;
    code: number;
    message: string;
  };
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

interface MeResponse {
  status: {
    success: boolean;
    code: number;
    message: string;
  };
  data: {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    photo: string;
    role?: {
      code?: string;
    };
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/login`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
        },
      }
    );
    return {
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
    };
  },

  loginWithGoogle: async (idToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/google`,
      { idToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
        },
      }
    );
    return {
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
    };
  },

  getMe: async (accessToken: string): Promise<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    photo: string;
    role?: string;
  }> => {
    const response = await axios.get<MeResponse>(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-App-Id': APP_ID,
      },
    });
    return {
      id: response.data.data.user_id,
      email: response.data.data.email,
      firstName: response.data.data.first_name || '',
      lastName: response.data.data.last_name || '',
      photo: response.data.data.photo || '',
      role: response.data.data.role?.code,
    };
  },

  logout: async (accessToken: string): Promise<void> => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        { refreshToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-App-Id': APP_ID,
          },
        }
      );
    } catch (error) {
      // Ignore logout errors
    }
  },
};
