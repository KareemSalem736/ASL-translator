// src/api/authApi.ts
import axios from './axiosConfig';

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user?: {
    email: string;
  };
}

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post('/auth/register', data);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Registration failed");
  }
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post('/auth/login', data);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Login failed");
  }
};

export const logoutUser = async (): Promise<{ message: string }> => {
  try {
    const response = await axios.post('/auth/logout');
    return response.data;
  } catch (err: any) {
    throw new Error("Logout failed");
  }
};
