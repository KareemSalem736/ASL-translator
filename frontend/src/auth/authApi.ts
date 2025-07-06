// This file contains the authentication API functions for user registration, login, logout, password reset, and Google sign-in.
// It uses Axios for HTTP requests and manages the access token in memory.

import axiosInstance from "../axiosConfig";
import {startTokenTimer, stopTokenTimer} from "./TokenManager.ts";

let accessToken: string | undefined = undefined;

/** Access token retrieval method. */
export const getAccessToken = (): string | undefined => {
  return accessToken;
}

/** → Setter whenever we get a new token from login/Google. */
export const setAccessToken = (token: string) => {
  accessToken = token;
  startTokenTimer(token);
};

/** → Remove everything (on logout or refresh failure). */
export const clearAuthData = () => {
  accessToken = undefined;
  stopTokenTimer();
};

/** 
 * Payload we send to /auth/register or /auth/login
 * Either `{ user: { email: "..." }, password: "..." }` 
 * OR `{ user: { phone: "..." }, password: "..." }`.
 */
export interface AuthRequest {
  identifier: string;
  type: string;
  password: string;
}

/** 
 * What the backend returns after /auth/register, /auth/login, or /auth/google. 
 * If successful, `access_token` should exist (and be stored in memory).
 */
export interface AuthResponse {
  username: string;           // user’s basic info
  message: string;       // e.g. "Registration successful" or "Invalid credentials"
  access_token: string; // JWT access token.
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/** Used by Google One-Tap: `response.credential` is the ID token. */
interface GoogleCredentialResponse {
  credential: string;
}

// ─── REGISTER ───
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data, {
      withCredentials: true
    });

    setAccessToken(response.data.access_token);

    return response.data;
  } catch (err: any) {
    // If backend threw a 400/422 with { detail: "..."}:
    throw new Error(err.response?.data?.detail || "Registration failed");
  }
};

// ─── LOGIN (email/username + password) ───
export const loginUser = async (data: AuthRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/login',
        {
          username: data.identifier,
          password: data.password,
          grant_type: "password"
        },
        { headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true
        });

    setAccessToken(response.data.access_token);

    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Login failed");
  }
};

// ─── LOGOUT ───
export const logoutUser = async (): Promise<string | void> => {
  try {
    const response = await axiosInstance.post<{ message: string }>("/auth/logout",
        {}, { withCredentials: true });

    clearAuthData();
    return response.data.message;
  } catch (err: any) {
    clearAuthData();
    throw new Error(err.response?.data?.detail || "Failed to send password reset email");
  }
};

// ─── GOOGLE SIGN-IN ───
export const handleCredentialResponse = async (response: GoogleCredentialResponse): Promise<AuthResponse> => {
  const idToken = response.credential;
  try {
    // Send the Google ID token to our backend. The backend will verify it, create/lookup the user, and return:
    // { user: { email: "..." }, access_token: "jwt", message: "Logged in with Google" }
    const response = await axiosInstance.post<AuthResponse>('/auth/google', {
      id_token: idToken,
    });

    const token = response.data.access_token;

    // Backend should set an HttpOnly refresh cookie automatically, so we only need to store the JWT access token (optional).
    if (token) {
      setAccessToken(token);
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Google sign-in failed');
  }
};

// --- VERIFY ACCESS TOKEN ---
export const verifyAccessToken = async (): Promise<void> => {
  try {
    console.log(getAccessToken());
    await axiosInstance.post<{message: string}>('/auth/verify')
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to verify access token");
  }
}

// ─── REFRESH ACCESS TOKEN ───
export const refreshAccessToken = async (): Promise<string> => {
  try {
    // The backend endpoint /auth/refresh should look at the HttpOnly cookie (refresh token),
    // verify it, and respond with a fresh { access_token: "newJwt" }.
    const response = await axiosInstance.post<{ access_token: string }>('/auth/refresh',
        {}, {withCredentials: true});

    console.log(response.data.access_token)
    setAccessToken(response.data.access_token);

    return response.data.access_token;
  } catch (error : any) {
    clearAuthData();
    throw new Error(error.response?.data?.detail || 'Session expired. Please log in again.');
  }
};

