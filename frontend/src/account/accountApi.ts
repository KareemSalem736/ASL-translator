import axiosInstance from "../axiosConfig.ts";
import {getAuthHeader} from "../auth/authApi.ts";

export interface AccountInfoResponse {
  username: string;
  email: string;
  total_predictions: number;
  prediction_history_size: number;
  last_login: string;
  creation_date: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export const addPredictionHistory = async (data: string): Promise<string | void> => {
  try {
    if (getAuthHeader()) {
      const response = await axiosInstance.post<{ message: string }>(
          '/account/add-prediction', data, {headers: getAuthHeader()},);

      if (response.status !== 200) {
        return;
      }
      return response.data.message;
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Prediction history update failed.");
  }
}

// --- GET USER INFO ---
export const requestAccountInfo = async (): Promise<AccountInfoResponse | void> => {
  try {
    const response = await axiosInstance.get<AccountInfoResponse>("/account/info")

    if (response.status !== 200) {
      return;
    }
    return response.data
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Failed to retrieve user info");
  }
}

// --- CHANGE PASSWORD ---
export const changeUserPassword = async (data: PasswordChangeRequest): Promise<string | void> => {
  try {
    // Send a request to the backend to change the password for the given user.
    const response = await axiosInstance.post<{ message: string }>(
        '/account/change-password', data, { headers: getAuthHeader() });

    // Check if there was a response from the backend.
    if (response.status !== 200) {
      return;
    }
    return response.data.message;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.response?.data?.detail || "Password change failed.");
  }
}

// ─── FORGOT PASSWORD ───
export const requestPasswordReset = async ( data: { email: string } ): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post<{ message: string }>
    ('/account/forgot-password', data, { headers: getAuthHeader() });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Failed to send password reset email");
  }
};