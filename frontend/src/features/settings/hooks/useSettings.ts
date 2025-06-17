// src/features/settings/hooks/useSettings.ts
import { useSettingsContext } from "../context/SettingsContext";

export const useSettings = () => {
  const {
    darkMode,
    webcamEnabled,
    predictionEnabled,
    setDarkMode,
    setWebcamEnabled,
    setPredictionEnabled,
  } = useSettingsContext();

  return {
    darkMode,
    webcamEnabled,
    predictionEnabled,
    toggleDarkMode: () => setDarkMode(!darkMode),
    toggleWebcam: () => setWebcamEnabled(!webcamEnabled),
    togglePrediction: () => setPredictionEnabled(!predictionEnabled),
  };
};
