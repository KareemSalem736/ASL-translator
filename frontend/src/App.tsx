import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/AboutPage";
import MainPage from "./pages/MainPage";
import HandTracker from "./components/ML/HandGesture";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/ml-test" element={<HandTracker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
