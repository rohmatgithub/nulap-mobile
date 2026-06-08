import axios from 'axios';

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
  };
}

interface MeResponse {
  status: {
    success: boolean;
    code: number;
    message: string;
  };
  data: {
    id: number;
    username: string;
    email: string;
    role_code?: string;
  };
}

export const authService = {
  login: async (username: string, password: string): Promise<{ accessToken: string }> => {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/login`,
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
        },
      }
    );
    return { accessToken: response.data.data.accessToken };
  },

  getMe: async (accessToken: string): Promise<{
    id: number;
    username: string;
    email: string;
    role?: string;
  }> => {
    const response = await axios.get<MeResponse>(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-App-Id': APP_ID,
      },
    });
    return {
      id: response.data.data.id,
      username: response.data.data.username,
      email: response.data.data.email,
      role: response.data.data.role_code,
    };
  },

  logout: async (accessToken: string): Promise<void> => {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
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
