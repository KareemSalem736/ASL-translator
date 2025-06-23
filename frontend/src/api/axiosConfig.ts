import axios from "axios";
import {
  getAccessToken,
  refreshAccessToken,
  clearAuthData,
} from "../features/auth/api/authApi";
import { debugError, debugLog } from "../utils/debugLog";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ─── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    debugLog("────────────────────────────────────────");
    debugLog("[Axios → Request]");
    debugLog("Full URL:  ", `${config.baseURL}${config.url}`);
    debugLog("Method:    ", config.method?.toUpperCase());
    debugLog("Headers:   ", JSON.stringify(config.headers, null, 2));
    if (config.params) debugLog("Params:    ", JSON.stringify(config.params, null, 2));
    if (config.data) debugLog("Payload:   ", JSON.stringify(config.data, null, 2));
    debugLog("────────────────────────────────────────");

    const token = getAccessToken();
    if (token && config.headers) {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    debugError("[Axios → Request Error]", error);
    return Promise.reject(error);
  }
);

// ─── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => {
    debugLog("────────────────────────────────────────");
    debugLog("[Axios ← Response]");
    debugLog("Full URL:  ", `${response.config.baseURL}${response.config.url}`);
    debugLog("Status:    ", response.status);
    debugLog("Headers:   ", JSON.stringify(response.headers, null, 2));
    debugLog("Data:      ", JSON.stringify(response.data, null, 2));
    debugLog("────────────────────────────────────────");
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const resp = error.response;

    debugError("────────────────────────────────────────");
    debugError("[Axios ← Response Error]");
    debugError("Full URL:  ", `${originalRequest.baseURL}${originalRequest.url}`);
    debugError("Method:    ", originalRequest.method?.toUpperCase());
    debugError("Headers:   ", JSON.stringify(originalRequest.headers, null, 2));
    if (originalRequest.data) {
      debugError("Payload:   ", JSON.stringify(originalRequest.data, null, 2));
    }

    if (resp) {
      debugError("Status:    ", resp.status);
      debugError("Headers:   ", JSON.stringify(resp.headers, null, 2));
      debugError("Data:      ", JSON.stringify(resp.data, null, 2));
    } else {
      debugError("No response received (network error or CORS issue)");
    }

    debugError("Error Object: ", error);
    debugError("────────────────────────────────────────");

    if (resp?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (e) {
        clearAuthData();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
