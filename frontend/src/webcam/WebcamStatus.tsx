import { useState, useCallback } from "react";
import type { PredictionResponse } from "../prediction/predictionAPI";

export interface Status {
  icon: string; // Bootstrap icon class (without the "bi-" prefix)
  text: string;
  variant: string; // Bootstrap text color class (e.g. 'text-success')
  autoClear?: boolean;
}

export function useStatus(autoClearDelay = 3000) {
  const [status, setStatus] = useState<Status | null>(null);

  const updateStatus = useCallback(
    (s: Status) => {
      setStatus(s);
      if (s.autoClear) {
        setTimeout(() => setStatus(null), autoClearDelay);
      }
    },
    [autoClearDelay]
  );

  const clearStatus = () => setStatus(null);

  return {
    status,
    setStatus: updateStatus,
    clearStatus,
  };
}

export function useStatusManager(
  setStatus: React.Dispatch<React.SetStateAction<Status | null>>
) {
  return {
    setCameraReady: () =>
      setStatus({
        icon: "camera-video",
        text: "Camera ready",
        variant: "text-success",
      }),
    setCameraOff: () =>
      setStatus({
        icon: "camera-video-off",
        text: "Camera turned off",
        variant: "text-white",
      }),
    setPredictionEnabled: () =>
      setStatus({
        icon: "exclamation-circle-fill",
        text: "Prediction enabled",
        variant: "text-success",
      }),
    setPredictionDisabled: () =>
      setStatus({
        icon: "exclamation-triangle-fill",
        text: "Prediction disabled",
        variant: "text-danger",
      }),
    setPredictionResult: (res: PredictionResponse) =>
      setStatus({
        icon: "brain",
        text: `Predicting: ${res.prediction} (${Math.round(
          res.confidence * 100
        )}%)`,
        variant: "text-info",
      }),
    setPredictionFailed: () =>
      setStatus({
        icon: "x-octagon",
        text: "Prediction failed",
        variant: "text-danger",
      }),
    setPermissionRequesting: () =>
      setStatus({
        icon: "camera-video",
        text: "Requesting camera access...",
        variant: "text-warning",
      }),
    setWebcamError: () =>
      setStatus({
        icon: "exclamation-triangle-fill",
        text: "Webcam error: access denied or unavailable",
        variant: "text-danger",
      }),
  };
}
