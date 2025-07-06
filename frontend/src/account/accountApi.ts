import axiosInstance from "../axiosConfig.ts";

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
        '/account/change-password', data);

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
    ('/account/forgot-password', data);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Failed to send password reset email");
  }
};