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

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Failed to send password reset email");
  }
};


export const handleCredentialResponse = async (response: any) => {
  const idToken = response.credential;

  try {
    const res = await axios.post("http://localhost:8000/auth/google", {
      id_token: idToken,
    });

    console.log("Backend response:", res.data);

    // You could store user info or token in context here
    // e.g., localStorage.setItem("token", res.data.access_token);
  } catch (error: any) {
    console.error("Google Sign-In error:", error.response?.data || error.message);
  }
};