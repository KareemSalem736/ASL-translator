// // This component renders a webcam feed with a canvas overlay for hand tracking.
// // It uses the `useHandTracking` hook to handle the hand tracking logic.
// // The webcam feed is only active when `isActive` is true, and it uses the `Webcam` component from `react-webcam`.
// // The canvas is used to draw landmarks and predictions on top of the webcam feed.

import { forwardRef, useRef } from "react";
import type Webcam from "react-webcam";
import WebcamDefault from "react-webcam";
import type { PredictionResponse } from "../../prediction/api/predictionAPI";
import { useHandTracking } from "../../prediction/hooks/useHandTracking";
import { useWebcam } from "../WebcamContext";

export interface WebcamFeedProps {
  width?: number;
  height?: number;
  onPredictionResult: (res: PredictionResponse) => void;
}

const WebcamFeed = forwardRef<HTMLVideoElement, WebcamFeedProps>(
  ({ width = 320, height = 240, onPredictionResult }, forwardedVideoRef) => {
    const webcamComponentRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Destructure all settings from context
    const { webcamActive, mirrored, showLandmarks, showPrediction } =
      useWebcam();

    // Hook for hand tracking with these live values
    useHandTracking({
      videoComponentRef: webcamComponentRef,
      canvasRef,
      onPredictionResult,
      isActive: webcamActive,
      width,
      height,
      showLandmarks,
      showPrediction,
    });

    return (
      <div
        className={`position-relative w-100 h-100 rounded-4 p-0 m-0 overflow-hidden ${
          webcamActive ? "" : "bg-dark"
        }`}
        style={{
          width: "100%",
          height: "100%",
          transform: mirrored ? "scaleX(-1)" : "none",
        }}
      >
        {webcamActive && (
          <WebcamDefault
            audio={false}
            ref={webcamComponentRef}
            mirrored={mirrored}
            videoConstraints={{ width, height, facingMode: "user" }}
            style={{ display: "none" }}
          />
        )}

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
