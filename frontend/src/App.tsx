import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/AboutPage";
import MainPage from "./pages/MainPage";
import InstrctionsPage from "./pages/InstrctionsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/instructions" element={<InstrctionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
