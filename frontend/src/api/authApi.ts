// This file contains the authentication API functions for user registration, login, logout, password reset, and Google sign-in.
// It uses Axios for HTTP requests and manages the access token in memory.

import axiosInstance from './axiosConfig';

// ─── In-memory store for the access token ───
// We do NOT persist the access token in localStorage to avoid XSS risk.
// The backend also sets an HttpOnly cookie (for refresh tokens or session), so we need `withCredentials:true`.
let accessToken: string | null = null;

/** → Getter for other modules (e.g. axios interceptor) */
export const getAccessToken = () => accessToken;

/** → Setter whenever we get a new token from login/Google. */
export const setAccessToken = (token: string) => {
  accessToken = token;
};

/** → Remove everything (on logout or refresh failure). */
export const clearAuthData = () => {
  accessToken = null;
  localStorage.removeItem('user');
};

// ─── Type definitions ───
export type USER =
  | { email: string; phone?: never }
  | { phone: string; email?: never };

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
  access_token?: string; // JWT (if not using cookie-only)
  token_type?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LogoutRequest {
  token: string;
}

export interface PasswordChangeRequest {
  token: string;
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

    // If the backend returns { access_token: "..." }, store it in memory:
    if (response.data.access_token) {
      console.log(response.data.access_token)
      setAccessToken(response.data.access_token);
    }
    return response.data;
  } catch (err: any) {
    // If backend threw a 400/422 with { detail: "..."}:
    throw new Error(err.response?.data?.detail || "Registration failed");
  }
};

// ─── LOGIN (email/username + password) ───
export const loginUser = async (data: AuthRequest): Promise<AuthResponse> => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", data.identifier);
    formData.append("password", data.password);
    formData.append("grant_type", "password")
    const response = await axiosInstance.post<AuthResponse>('/auth/login', formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true
    });

    // If the backend returns { access_token: "..." }, store it in memory:
    if (response.data.access_token) {
      console.log(response.data.access_token)
      setAccessToken(response.data.access_token);
    }
    console.log(getAccessToken())
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Login failed");
  }
};

// ─── LOGOUT ───
export const requestUserLogout = async (data: LogoutRequest): Promise<string | void> => {
  try {
    const response = await axiosInstance.post<{ message: string }>("/auth/logout", data, { withCredentials: true });
    clearAuthData();

    if (response.status !== 200) {
      return;
    }
    return "Successfully logged out";
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Failed to send password reset email");
  }

};

// ─── FORGOT PASSWORD ───
export const requestPasswordReset = async (user: USER): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post<{ message: string }>('/auth/forgot-password', { user });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Failed to send password reset email");
  }
};

// --- RESET PASSWORD ---
export const changeUserPassword = async (data: PasswordChangeRequest): Promise<string | void> => {
  try {
    // Send a request to the backend to change the password for the given user.
    const response = await axiosInstance.post<string>('/auth/passwordchange', {
      token: data.token,
      password: data.password
    });

    // Check if there was a response from the backend.
    if (response.status !== 200) {
      return;
    }
    return "Password successfully updated.";
  } catch (error: any) {
    const msg = error.response?.data?.detail || "Password change failed.";
    throw new Error(msg);
  }
}

// ─── GOOGLE SIGN-IN ───
export const handleCredentialResponse = async (response: GoogleCredentialResponse): Promise<AuthResponse> => {
  const idToken = response.credential;
  try {
    // Send the Google ID token to our backend. The backend will verify it, create/lookup the user, and return:
    // { user: { email: "..." }, access_token: "jwt", message: "Logged in with Google" }
    const res = await axiosInstance.post<AuthResponse>('/auth/google', {
      id_token: idToken,
    });

    // Backend should set an HttpOnly refresh cookie automatically, so we only need to store the JWT access token (optional).
    if (res.data.access_token) {
      setAccessToken(res.data.access_token);
    }
    if (res.data.username) {
      localStorage.setItem('user', JSON.stringify(res.data.username));
    }
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.detail || 'Google sign-in failed';
    throw new Error(msg);
  }
};

export const isAccessTokenValid = async (): Promise<string | void> => {
  let token = getAccessToken()
  if (!token) {
    token = await refreshAccessToken()
    setAccessToken(token)
    return token;
  }

  const response = await axiosInstance.post("/auth/verify", {
    headers: {
      "Authorization": `Bearer ${getAccessToken()}`,
    },
    data: {}
  });

  if (response.status === 200) {
    return token;
  } else {
    return;
  }
};

// ─── REFRESH ACCESS TOKEN ───
export const refreshAccessToken = async (): Promise<string> => {
  try {
    // The backend endpoint /auth/refresh should look at the HttpOnly cookie (refresh token),
    // verify it, and respond with a fresh { access_token: "newJwt" }.
    const response = await axiosInstance.post<{ access_token: string }>('/auth/refresh',
        {}, { withCredentials: true});

    return response.data.access_token;
  } catch {
    clearAuthData();
    throw new Error("Session expired. Please log in again.");
  }
};

