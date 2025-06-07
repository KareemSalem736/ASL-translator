# Frontend (Vite + React TypeScript)

## 1. Project Overview

This repository contains the front-end application built with Vite, React, and TypeScript. It communicates with a backend API for authentication (including Google OAuth) and for making hand-prediction requests.

- **Tech stack**:

  - Vite (build tool)
  - React (v19.1.0) + TypeScript
  - Axios for HTTP requests
  - Bootstrap 5 for styling
  - ESLint for linting

- **High-level architecture**:

  - The React app runs on Vite’s development server (default port 5173).
  - It communicates with a backend API at `VITE_API_URL` (e.g., `http://localhost:8000/api`).
  - Authentication flows include email/phone + password, Google Sign-In, token refreshing via HttpOnly cookies.
  - A protected `/predict` endpoint returns hand-prediction results sent from a webcam component (`react-webcam`).

---

## 2. Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher (you can also use Yarn or pnpm, but this README assumes npm)
- **Git**: to clone the repository
- **Optional global tools** (only if you prefer):

  - `npm install -g eslint` (if you want to run ESLint globally, otherwise the local `npm run lint` suffices)

---

## 3. Installation & Initial Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-org/frontend.git
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Copy the example file:

     ```bash
     cp .env ..env.local
     ```

   - Open `.env.local` (created above) and fill in each variable. See the next section for descriptions.

---

## 4. Environment / Configuration

All environment variables start with `VITE_` so that Vite injects them at build time. Never commit secrets to Git — keep your real values in `.env.local` (which should be gitignored).

```dotenv
# .env (example)

# Base URL for all API calls (development)
VITE_API_URL=http://localhost:8000/api

# Google OAuth Client ID (for Google Sign-In)
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID

# (Optional) Frontend origin, if backend needs to know for redirects
VITE_FRONTEND_URL=http://localhost:5173

# Debug flags
VITE_ENV=development
VITE_ENABLE_LOGGING=true
```

1. **`VITE_API_URL`**

   - The base URL for the backend API.
   - Example: `http://localhost:8000/api` (in development).
   - In production, your CI/CD pipeline or hosting provider should set `VITE_API_URL` to the production API (e.g. `https://api.example.com`).

2. **`VITE_GOOGLE_CLIENT_ID`**

   - Your Google OAuth Client ID to enable “Sign in with Google.”
   - The backend must verify the Google ID token and return a JWT or set an HttpOnly cookie.

3. **`VITE_FRONTEND_URL`**

   - The origin of this front end—used if your backend needs to build OAuth redirect URIs.
   - Typically `http://localhost:5173` in development; change for staging/production.

4. **`VITE_ENV` & `VITE_ENABLE_LOGGING`**

   - Custom flags you can read in your code (e.g. enable verbose logging in dev).
   - Helpful for toggling features.

---

## 5. Running Locally

Use the npm scripts defined in `package.json`:

```bash
# Start Vite dev server with hot module replacement (HMR)
npm run dev
# → App runs at http://localhost:5173 by default

# Build for production (TypeScript compilation + Vite build)
npm run build
# → Outputs to `dist/` folder

# Preview the production build locally
npm run preview
# → Serves from `dist/` at http://localhost:4173 (or Vite’s assigned port)

# Lint all files
npm run lint
```

- **Default port**: Vite uses `5173`. You can override via:

  ```bash
  PORT=4000 npm run dev
  ```

- **Changing the API proxy (if needed)**:
  By default, we rely on `axios`’s `baseURL` (`VITE_API_URL`). If you want to proxy `/api` → `http://localhost:8000/api`, add to `vite.config.ts`:

  ```ts
  // vite.config.ts
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";

  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  });
  ```

  Then in your code, you can simply call `/api/…” instead of the full `VITE_API_URL\`. Adjust as desired.

---

## 6. Build & Deployment

1. **Production build**

   ```bash
   npm run build
   ```

   - Runs `tsc -b` (compiles TypeScript) and then `vite build`.
   - Generates a `dist/` folder containing static assets (HTML, JS, CSS).

2. **Environment variables for production**

   - In your hosting/CI environment (e.g., Netlify, Vercel, AWS Amplify), set:

     - `VITE_API_URL=https://api.yourdomain.com/api`
     - `VITE_GOOGLE_CLIENT_ID=<your-production-google-client-id>`
     - `VITE_FRONTEND_URL=https://app.yourdomain.com`

   - The production build will automatically bake these into the static site.

3. **Deploy instructions** (example for Netlify/Vercel)

   - **Netlify**:

     1. Connect repo to Netlify.
     2. Build command: `npm run build`.
     3. Publish directory: `dist/`.
     4. Under “Environment variables,” set the `VITE_*` keys.

   - **Vercel**:

     1. `vercel --prod` in the repo root OR connect via dashboard.
     2. Framework preset: “Vite.”
     3. Set environment variables under “Project Settings → Environment Variables.”

   - **Manual (e.g., S3 + CloudFront)**:

     1. Run `npm run build`.
     2. Upload the contents of `dist/` to `s3://your-bucket-name/`.
     3. Invalidate the CloudFront distribution cache, if applicable:

        ```bash
        aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
        ```

---

## 7. API Contract / Backend Integration

The front end uses Axios (`src/api/axiosConfig.ts`) with interceptors to attach JWT access tokens and to refresh them automatically if a 401 occurs. The API endpoints include authentication flows and a hand-prediction endpoint.

### 7.1 Base URL & Axios Configuration

```ts
// src/api/axiosConfig.ts
import axios from "axios";
import { getAccessToken, refreshAccessToken } from "./authApi";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // to send HttpOnly cookies (refresh token)
});

// Attach JWT if present
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    (config.headers as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${token}`;
  }
  return config;
});

// Automatically refresh token on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        return axiosInstance(originalRequest);
      } catch {
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
```

### 7.2 Authentication Endpoints

| Endpoint                     | Method | Description                                                                                       |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `POST /auth/register`        | POST   | Register a new user. Body: `{ user: { email: string } or { phone: string }, password: string }`   |
| `POST /auth/login`           | POST   | Login existing user. Body: same as register. Returns `AuthResponse` with optional `access_token`. |
| `POST /auth/google`          | POST   | Google Sign-In. Body: `{ id_token: string }`. Backend verifies and returns `access_token`.        |
| `POST /auth/logout`          | POST   | Invalidate session on server. Clears in-memory token and any HttpOnly cookie.                     |
| `POST /auth/forgot-password` | POST   | Request password reset. Body: `{ user: { email or phone } }`.                                     |
| `POST /auth/refresh`         | POST   | Refresh the access token. Backend reads HttpOnly cookie and returns a fresh `{ access_token }`.   |

#### Type Definitions & Helpers

```ts
// src/api/authApi.ts

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
  access_token?: string;
}
```

- **In-memory token storage**:

  ```ts
  let accessToken: string | null = null;
  export const getAccessToken = () => accessToken;
  export const setAccessToken = (token: string) => {
    accessToken = token;
  };
  export const clearAuthData = () => {
    accessToken = null;
    localStorage.removeItem("user");
  };
  ```

- **Registration & Login**

  ```ts
  export const registerUser = async (
    data: AuthRequest
  ): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      data
    );
    return response.data;
  };

  export const loginUser = async (data: AuthRequest): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>("/auth/login", data);
    if (res.data.access_token) setAccessToken(res.data.access_token);
    return res.data;
  };
  ```

- **Google Sign-In**

  ```ts
  interface GoogleCredentialResponse {
    credential: string;
  }

  export const handleCredentialResponse = async (
    response: GoogleCredentialResponse
  ): Promise<AuthResponse> => {
    const idToken = response.credential;
    const res = await axiosInstance.post<AuthResponse>("/auth/google", {
      id_token: idToken,
    });
    if (res.data.access_token) setAccessToken(res.data.access_token);
    if (res.data.user)
      localStorage.setItem("user", JSON.stringify(res.data.user));
    return res.data;
  };
  ```

- **Logout & Refresh**

  ```ts
  export const logoutUser = async (): Promise<{ message: string }> => {
    const res = await axiosInstance.post<{ message: string }>("/auth/logout");
    clearAuthData();
    return res.data;
  };

  export const refreshAccessToken = async (): Promise<string> => {
    const res = await axiosInstance.post<{ access_token: string }>(
      "/auth/refresh"
    );
    setAccessToken(res.data.access_token);
    return res.data.access_token;
  };
  ```

### 7.3 Hand-Prediction Endpoint

```ts
// src/api/predictionApi.ts
import axiosInstance from "./axiosConfig";

export interface PredictionResponse {
  prediction: string;
  confidence: number;
  accuracy?: number;
  probabilities?: Record<string, number>;
  inferenceTimeMs?: number;
}

export const DEFAULT_PREDICTIONRESPONSE = {
  prediction: "",
  confidence: 0,
  accuracy: 0,
  probabilities: {},
  inferenceTimeMs: 0,
};

export async function getHandPrediction(
  landmarks: number[]
): Promise<PredictionResponse> {
  try {
    const response = await axiosInstance.post<PredictionResponse>("/predict", {
      landmarks,
    });
    return response.data;
  } catch (err) {
    console.error("Error in getHandPrediction:", err);
    return DEFAULT_PREDICTIONRESPONSE;
  }
}
```

- **Payload**:

  - `landmarks` is an array of 63 numbers (21 points × 3 coordinates).
  - The backend returns a shape conforming to `PredictionResponse`.

---

## 8. Directory Structure

Below is a high-level overview of the most important folders and files:

```
.
├── eslint.config.js            # ESLint config
├── index.html                  # Vite HTML template
├── package.json                # Scripts & dependencies
├── public/                     # Static assets (images, logos)
│   ├── logo1.svg
│   ├── logo2.svg
│   └── vite.svg
├── README.md                   # ← This file
├── src/
│   ├── api/                    # Axios configs & API modules
│   │   ├── axiosConfig.ts
│   │   ├── authApi.ts
│   │   └── predictionApi.ts
│   ├── assets/                 # Images, icons, etc. used by components
│   ├── components/             # Reusable React components
│   ├── hooks/                  # Custom React hooks (e.g. useAuth, useWebcam)
│   ├── pages/                  # Top-level route components (MainPage, InstrctionsPage, etc.)
│   ├── utils/                  # Utility functions (formatters, constants)
│   ├── workers/                # Web Workers or service workers (if any)
│   ├── App.tsx                 # Root React component and route setup
│   ├── main.tsx                # Entry point (renders `<App />` to DOM)
│   ├── index.css               # Global CSS (e.g., Bootstrap overrides)
│   └── vite-env.d.ts            # Vite type declarations
├── tsconfig.app.json           # TypeScript config for the app (paths/aliases, if any)
├── tsconfig.node.json          # TS config for any Node-based scripts (if used)
├── tsconfig.json               # Base TS config (references the above)
└── vite.config.ts              # Vite configuration (plugins, etc.)
```

---

## 9. Common Workflows / Commands

- **Start Development Server**

  ```bash
  npm run dev
  ```

  Runs Vite in development mode with HMR. Visit `http://localhost:5173`.

- **Build for Production**

  ```bash
  npm run build
  ```

  - Compiles TypeScript (`tsc -b`).
  - Bundles and minifies via Vite into `dist/`.

- **Preview Production Build Locally**

  ```bash
  npm run preview
  ```

  Serves the contents of `dist/` on a local port (usually 4173) so you can verify the build.

- **Run Linter**

  ```bash
  npm run lint
  ```

  Uses ESLint with the config in `eslint.config.js` to check for code issues.

---

## 10. Testing

Currently, there are no unit or integration tests configured out of the box. If you plan to add tests later:

1. Install a testing framework (e.g., Jest or Vitest).
2. Add a test script to `package.json`, for example:

   ```json
   "scripts": {
     "test": "vitest"
   }
   ```

3. Follow conventions:

   - Unit tests: place files under `src/__tests__/` or name them `*.spec.tsx`.
   - E2E tests: consider Cypress or Playwright in a `cypress/` or `e2e/` folder.

---

## 11. Linting & Formatting

- **ESLint configuration** (`eslint.config.js`)

  - Uses `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, and `typescript-eslint`.
  - To fix lint issues automatically:

    ```bash
    npm run lint -- --fix
    ```

- **Prettier (optional)**

  - If you want consistent code formatting, install `prettier` and add a `.prettierrc` file.
  - Add a `format` script in `package.json`:

    ```json
    "scripts": {
      "format": "prettier --write \"src/**/*.{ts,tsx,css,scss,md}\""
    }
    ```

- **Git hooks (optional)**

  - You can integrate Husky + lint-staged to run `npm run lint -- --fix` on each commit.
  - Example `.husky/pre-commit`:

    ```bash
    #!/usr/bin/env sh
    . "$(dirname -- "$0")/_/husky.sh"

    npm run lint -- --fix
    git add .
    ```

---

## 12. Deployment & CI/CD

> _No CI/CD pipeline is configured by default. Below is a suggested workflow if you wish to add one._

1. **GitHub Actions Example**

   - Create `.github/workflows/ci.yml`:

     ```yaml
     name: CI

     on:
       push:
         branches: [main, develop]
       pull_request:
         branches: [main, develop]

     jobs:
       build:
         runs-on: ubuntu-latest
         strategy:
           matrix:
             node-version: [16.x]
         steps:
           - uses: actions/checkout@v3
           - name: Setup Node.js
             uses: actions/setup-node@v3
             with:
               node-version: ${{ matrix.node-version }}
           - name: Install Dependencies
             run: npm ci
           - name: Lint
             run: npm run lint
           - name: Build
             run: npm run build
     ```

   - When merging into `develop`, you could set up an Action to deploy to a staging environment (e.g., Netlify’s “Deploy to Preview” or AWS S3 bucket).
   - When merging into `main`, deploy the `dist/` folder to production (Netlify, Vercel, S3, etc.).

2. **Environment Variables in CI**

   - In GitHub Actions → Settings → Secrets:

     - `VITE_API_URL`: e.g. `https://api.yourdomain.com/api`
     - `VITE_GOOGLE_CLIENT_ID`: production Google OAuth Client ID
     - `VITE_FRONTEND_URL`: `https://app.yourdomain.com`

---

## 13. Troubleshooting / FAQs

- **Cannot connect to API**

  - Ensure your backend is running on `http://localhost:8000/api` (or whatever `VITE_API_URL` you set).
  - Verify `.env.local` has the correct `VITE_API_URL`.
  - If using a proxy in `vite.config.ts`, ensure the proxy target is correct.

- **CORS errors**

  - The backend must allow cross-origin requests from `http://localhost:5173`.
  - If you use Vite’s proxy (`/api → http://localhost:8000`), you can avoid CORS altogether.

- **401 Unauthorized / Token Expired**

  - The Axios interceptor automatically attempts to refresh the access token using `POST /auth/refresh`.
  - Ensure the backend sets an HttpOnly refresh cookie on `POST /auth/login` or `POST /auth/google`.

- **Build errors (TypeScript)**

  - Run `npm run build` locally to see the full error stack.
  - Make sure `tsconfig.app.json` and `tsconfig.json` are correctly referencing each other.
  - If you added path aliases in `tsconfig`, reflect them in `vite.config.ts`’s `resolve.alias` section:

    ```ts
    import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";
    import path from "path";

    export default defineConfig({
      plugins: [react()],
      resolve: {
        alias: {
          "@components": path.resolve(__dirname, "src/components"),
          "@api": path.resolve(__dirname, "src/api"),
        },
      },
    });
    ```

---

## 14. Contribution Guidelines

Refer to root README.md file

<sub>Last updated: June 4, 2025</sub>
