import React, { createContext, useContext, useState, useEffect } from "react";

type Settings = {
  darkMode: boolean;
  webcamEnabled: boolean;
  predictionEnabled: boolean;
  setDarkMode: (val: boolean) => void;
  setWebcamEnabled: (val: boolean) => void;
  setPredictionEnabled: (val: boolean) => void;
};

const SettingsContext = createContext<Settings | undefined>(undefined);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [predictionEnabled, setPredictionEnabled] = useState(true);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        webcamEnabled,
        predictionEnabled,
        setDarkMode,
        setWebcamEnabled,
        setPredictionEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext must be used within SettingsProvider");
  }
  return context;
};
