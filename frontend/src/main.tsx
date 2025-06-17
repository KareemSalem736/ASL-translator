//Thhis file is part of the frontend application for a web project.
// It sets up the main entry point for the React application, imports necessary styles,
// and renders the main App component into the root element of the HTML document.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import App from "./App.tsx";
import { SettingsProvider } from "./features/settings/context/SettingsContext.tsx";
import { WebcamProvider } from "./features/webcam/WebcamContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsProvider>
      <WebcamProvider>
        <App />
      </WebcamProvider>
    </SettingsProvider>
  </StrictMode>
);
