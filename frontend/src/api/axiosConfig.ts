// src/api/axiosConfig.ts

import axios from "axios";
import {
  getAccessToken,
  refreshAccessToken,
  clearAuthData,
} from "./authApi";

/**
 * Create a single Axios instance that all of your API calls will use.
 * - `baseURL` is the root URL for every request (e.g. "http://localhost:8000").
 * - `withCredentials: true` means “send cookies and auth headers if present.”
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. "http://localhost:8000 see .env file in frontend folder"
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * ─── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
 * Runs before every request. Here we:
 *   1. Log full details (URL, method, headers, params, payload) in development.
 *   2. Attach the JWT from getAccessToken() (if available) into the "Authorization" header.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      // Note: In dev mode, print a separator so logs are easier to read
      console.log("────────────────────────────────────────");
      console.log("[Axios → Request]");

      // config.baseURL is what you set above ("http://localhost:8000")
      // config.url is the path or full URL you passed in your .get/.post call
      // If config.url = "/predict", then full URL = baseURL + url = "http://localhost:8000/predict"
      console.log("baseURL:   ", config.baseURL);
      console.log("url:       ", config.url);
      console.log("Full URL:  ", `${config.baseURL}${config.url}`);

      console.log("Method:    ", config.method?.toUpperCase());
      console.log("Headers:   ", JSON.stringify(config.headers, null, 2));

      // If any query params were set (e.g. axiosInstance.get("/users", { params: { page: 2 } }))
      if (config.params) {
        console.log("Params:    ", JSON.stringify(config.params, null, 2));
      }

      // If this is a POST/PUT/PATCH with a request body, log it too
      if (config.data) {
        console.log("Payload:   ", JSON.stringify(config.data, null, 2));
      }
      console.log("────────────────────────────────────────");
    }

    // Attach the access token (if it exists)
    const token = getAccessToken();
    if (token && config.headers) {
      (config.headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // If something went wrong setting up the request
    if (import.meta.env.DEV) {
      console.error("[Axios → Request Error]", error);
    }
    return Promise.reject(error);
  }
);

/**
 * ─── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────────
 * Runs after every response (or error). Here we:
 *   1. On success, log full details (URL, status, headers, data) in development.
 *   2. On error, log request + response details, then if 401 try to refresh the token once.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Successful response (HTTP 2xx)
    if (import.meta.env.DEV) {
      console.log("────────────────────────────────────────");
      console.log("[Axios ← Response]");

      // response.config.url is the same path you requested (e.g. "/predict")
      console.log("baseURL:   ", response.config.baseURL);
      console.log("url:       ", response.config.url);
      console.log(
        "Full URL:  ",
        `${response.config.baseURL}${response.config.url}`
      );

      console.log("Status:    ", response.status);
      console.log("Headers:   ", JSON.stringify(response.headers, null, 2));
      console.log("Data:      ", JSON.stringify(response.data, null, 2));
      console.log("────────────────────────────────────────");
    }
    return response;
  },
  async (error) => {
    // An error response (network error, 4xx, 5xx, etc.)
    const originalRequest = error.config;
    const resp = error.response; // may be undefined if there was no response

    if (import.meta.env.DEV) {
      console.error("────────────────────────────────────────");
      console.error("[Axios ← Response Error]");

      // Show what the original request was
      console.error("Request baseURL:      ", originalRequest.baseURL);
      console.error("Request url:          ", originalRequest.url);
      console.error(
        "Request Full URL:     ",
        `${originalRequest.baseURL}${originalRequest.url}`
      );
      console.error(
        "Request Method:       ",
        originalRequest.method?.toUpperCase()
      );
      console.error(
        "Request Headers:      ",
        JSON.stringify(originalRequest.headers, null, 2)
      );
      if (originalRequest.data) {
        console.error(
          "Request Payload:      ",
          JSON.stringify(originalRequest.data, null, 2)
        );
      }

      if (resp) {
        // Server replied with a status code (e.g. 400, 401, 500)
        console.error("Response Status:      ", resp.status);
        console.error(
          "Response Headers:     ",
          JSON.stringify(resp.headers, null, 2)
        );
        console.error(
          "Response Data:        ",
          JSON.stringify(resp.data, null, 2)
        );
      } else {
        // No response received (network error, CORS, DNS, etc.)
        console.error("No response received (network error or CORS issue)");
      }

      console.error("Error Object:         ", error);
      console.error("────────────────────────────────────────");
    }

    // If we got a 401 and haven’t retried yet, attempt to refresh the access token
    if (resp?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (e) {
        // If refresh fails, clear auth data and reject
        clearAuthData();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
