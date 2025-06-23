// This is the main App component that sets up the routing for the application.
// It uses React Router to define different routes for the application, including the main page, about page, and instructions page.

import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/AboutPage";
import MainPage from "./pages/MainPage";
import InstructionsPage from "./pages/InstructionsPage.tsx";
import AuthTestPage from "./pages/AuthTestPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/authtest" element={<AuthTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
