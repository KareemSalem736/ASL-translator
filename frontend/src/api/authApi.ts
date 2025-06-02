// src/api/authApi.ts
import axiosInstance from './axiosConfig';

let accessToken: string | null = null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string) => {
  accessToken = token;
};


export type USER = 
  | { email: string; phone?: never }
  | { phone: string; email?: never };


export interface AuthRequest {
  user: USER;
  password: string;
}

export interface AuthResponse {
  user?: USER;
  message: string;
  access_token?: string; // for Google OAuth and regular login
}

interface GoogleCredentialResponse {
  credential: string;
}


export const registerUser = async (data: AuthRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Registration failed");
  }
};

export const loginUser = async (data: AuthRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/login', data);
    setAccessToken(response.data.access_token || '');
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Login failed");
  }
};

export const logoutUser = async (): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    clearAuthData();
    return response.data;
  } catch (err: any) {
    throw new Error("Logout failed");
  }
};

export const requestPasswordReset = async (user: USER): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', { user });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Failed to send password reset email");
  }
};


export const handleCredentialResponse = async (response: GoogleCredentialResponse): Promise<AuthResponse> => {
  const idToken = response.credential;

  try {
    const res = await axiosInstance.post<AuthResponse>('/auth/google', {
      id_token: idToken,
    });

    // Cookie is automatically set by backend (httpOnly)
    // No need to store access_token manually

    // For storeing lightweight user data such as UI preferances and settings (dont store access_token or credential information)
    const { user, access_token } = res.data;
    
    if (accessToken) {
      setAccessToken(accessToken);
    }
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.detail || 'Google sign-in failed';
    console.error('Google Sign-In error:', msg);
    throw new Error(msg);
  }
};

export const refreshAccessToken = async (): Promise<string> => {
  try {
    const res = await axiosInstance.post('/auth/refresh');
    setAccessToken(res.data.access_token);
    return res.data.access_token;
  } catch {
    clearAuthData();
    throw new Error("Session expired. Please log in again.");
  }
};


export const clearAuthData = () => {
  accessToken = null;
  localStorage.removeItem('user');
};
