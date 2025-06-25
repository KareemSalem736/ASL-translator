// src/context/WebcamContext.tsx

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type Dispatch,
  type SetStateAction,
} from "react";

// ─── Type Definition ─────────────────────────────────────────────
export interface WebcamContextType {
  videoRef: RefObject<HTMLVideoElement | null>;
  isFullscreen: boolean;
  setIsFullscreen: Dispatch<SetStateAction<boolean>>;
  webcamActive: boolean;
  setWebcamActive: Dispatch<SetStateAction<boolean>>;
  mirrored: boolean;
  setMirrored: Dispatch<SetStateAction<boolean>>;
  showLandmarks: boolean;
  setShowLandmarks: Dispatch<SetStateAction<boolean>>;
  showPrediction: boolean;
  setShowPrediction: Dispatch<SetStateAction<boolean>>;
  mediaStream: MediaStream | null;
  setMediaStream: Dispatch<SetStateAction<MediaStream | null>>;
}

// ─── Context Creation ────────────────────────────────────────────
const WebcamContext = createContext<WebcamContextType | null>(null);

// ─── Custom Hook ─────────────────────────────────────────────────
export const useWebcam = (): WebcamContextType => {
  const context = useContext(WebcamContext);
  if (!context) {
    throw new Error("useWebcam must be used within a WebcamProvider");
  }
  return context;
};

// ─── Provider Component ──────────────────────────────────────────
export const WebcamProvider = ({ children }: { children: ReactNode }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webcamActive, setWebcamActive] = useState(true);
  const [mirrored, setMirrored] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showPrediction, setShowPrediction] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const value: WebcamContextType = {
    videoRef,
    isFullscreen,
    setIsFullscreen,
    webcamActive,
    setWebcamActive,
    mirrored,
    setMirrored,
    showLandmarks,
    setShowLandmarks,
    showPrediction,
    setShowPrediction,
    mediaStream,
    setMediaStream,
  };

  return (
    <WebcamContext.Provider value={value}>{children}</WebcamContext.Provider>
  );
};
