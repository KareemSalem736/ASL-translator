# ASL Translator – Frontend

This is the frontend for the ASL Translator project, built with **React**, **Vite**, and **TypeScript**. It serves as the user interface for capturing webcam input, sending it to the backend for interpretation, and displaying the results.

Authentication features (like login and Google Sign-In) are visually scaffolded but not yet functional.

---

## 🧰 Tech Stack

- **React + TypeScript** – UI development
- **Vite** – Fast build tool and dev server
- **Axios** – Handles API requests
- **Bootstrap 5** – Styling and layout
- **Jest + React Testing Library** – Unit testing
- **ESLint** – Linting for consistent code quality

---

## 🚀 Getting Started

To run the frontend locally:

1. **Install dependencies**

   ```bash
   npm install
````

2. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_FRONTEND_URL=http://localhost:5173
   ```

   * `VITE_API_URL` is the base URL for backend requests.
   * `VITE_FRONTEND_URL` may be used by the backend for redirect or CORS configuration.

3. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173).

4. **(Optional) Build the project**

   ```bash
   npm run build
   ```

   This generates a production-ready version of the app in the `dist/` folder.

---

## 🧪 Running Tests

To run the test suite locally:

```bash
npm test
```

Tests use **Jest** and **React Testing Library**, and are automatically run via **GitHub Actions** on each push or pull request involving frontend code.

---

## 🔐 Auth Placeholder

The Login page and Google Sign-In button are visual placeholders only. No authentication logic is currently implemented. These components are intended for future backend integration.

---

## 🤝 Contributing

If you're contributing to the frontend, please follow these conventions:

* Use consistent code style; run `npm run lint` to check for issues.
* Place reusable components in `src/components/`
* Use clear and descriptive commit messages.
* Run tests before pushing changes.
* Open pull requests against the `develop` branch unless otherwise discussed.

---

## 🐞 Troubleshooting

* **CORS errors**
  Ensure your backend allows requests from `http://localhost:5173`.

* **API connection issues**
  Double-check your `.env.local` file and confirm the backend is running on the correct port.

---
