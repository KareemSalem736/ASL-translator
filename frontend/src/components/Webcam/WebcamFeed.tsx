// This component renders a webcam feed with a canvas overlay for hand tracking.
// It uses the `useHandTracking` hook to handle the hand tracking logic.
// The webcam feed is only active when `isActive` is true, and it uses the `Webcam` component from `react-webcam`.
// The canvas is used to draw landmarks and predictions on top of the webcam feed.

import { forwardRef, useRef } from "react";
import type Webcam from "react-webcam"; // type‐only
import WebcamDefault from "react-webcam"; // actual component
import { useHandTracking } from "../../hooks/useHandTracking";
import type { PredictionResponse } from "../../api/predictionAPI";

export interface WebcamFeedProps {
  width?: number;
  height?: number;
  mirrored?: boolean;
  onPredictionResult: (res: PredictionResponse) => void;
  isActive: boolean;

  /** NEW: if false, skip sending to worker */
  showLandmarks?: boolean; // ← already existed
  showPrediction: boolean; // ← NEW
}

const WebcamFeed = forwardRef<HTMLVideoElement, WebcamFeedProps>(
  (
    {
      width = 320,
      height = 240,
      mirrored = true,
      onPredictionResult,
      isActive,
      showLandmarks = true,
      showPrediction,
    },
    forwardedVideoRef // unused, but kept for compatibility
  ) => {
    const webcamComponentRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // ─── Use the custom hook for hand tracking ───
    // This hook handles the hand tracking logic, including setting up the MediaPipe Hands model,
    // drawing landmarks, and sending predictions to the backend.
    // It takes care of the video component reference, canvas reference, and other parameters.
    // The hook will automatically start and stop the camera based on the `isActive` prop.
    useHandTracking({
      videoComponentRef: webcamComponentRef,
      canvasRef,
      onPredictionResult,
      isActive,
      width,
      height,
      showLandmarks,
      showPrediction,
    });

    return (
      <div
        className={`position-relative w-100 h-100 rounded-4 p-0 m-0 overflow-hidden ${
          isActive ? "" : "bg-dark"
        }`}
        style={{ width: "100%", height: "100%" }}
      >
        {/* The webcam feed is rendered here */}
        {/* The `videoConstraints` prop is used to set the width, height, and facing mode of the webcam */}
        {isActive && (
          <WebcamDefault
            audio={false}
            ref={webcamComponentRef}
            mirrored={mirrored}
            videoConstraints={{ width, height, facingMode: "user" }}
            style={{ display: "none" }}
          />
        )}

        {/* The canvas is used to draw landmarks and predictions on top of the webcam feed */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="position-absolute top-0 start-0 rounded-4"
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        />
      </div>
    );
  }
);

WebcamFeed.displayName = "WebcamFeed";
export default WebcamFeed;
