// src/components/Webcam/WebcamFeed.tsx
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
      showPrediction, // ← NEW
    },
    forwardedVideoRef
  ) => {
    const webcamComponentRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useHandTracking({
      videoComponentRef: webcamComponentRef,
      canvasRef,
      onPredictionResult,
      isActive,
      width,
      height,
      showLandmarks, // ← pass‐through
      showPrediction, // ← pass‐through
    });

    return (
      <div
        className={`position-relative w-100 h-100 rounded-4 p-0 m-0 overflow-hidden ${
          isActive ? "" : "bg-dark"
        }`}
        style={{ width: "100%", height: "100%" }}
      >
        {isActive && (
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
