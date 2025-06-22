// // This component renders a webcam feed with a canvas overlay for hand tracking.
// // It uses the `useHandTracking` hook to handle the hand tracking logic.
// // The webcam feed is only active when `isActive` is true, and it uses the `Webcam` component from `react-webcam`.
// // The canvas is used to draw landmarks and predictions on top of the webcam feed.

import { forwardRef, useEffect, useRef, useState } from "react";
import type Webcam from "react-webcam";
import WebcamDefault from "react-webcam";
import type { PredictionResponse } from "../prediction/predictionAPI";
import { useHandTracking } from "../prediction/useHandTracking";
import { useWebcam } from "../webcam/WebcamContext";

export interface WebcamFeedProps {
  width?: number;
  height?: number;
  onPredictionResult: (res: PredictionResponse) => void;
}

const WebcamFeed = forwardRef<HTMLVideoElement, WebcamFeedProps>(
  ({ width = 1280, height = 720, onPredictionResult }, forwardedVideoRef) => {
    const webcamComponentRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [deviceId, setDeviceId] = useState<string>("");

    // Destructure all settings from context
    const { webcamActive, mirrored, showLandmarks, showPrediction } =
      useWebcam();

    useEffect(() => {
      navigator.mediaDevices
        .getUserMedia({ video: true }) // Triggers prompt
        .then(() => navigator.mediaDevices.enumerateDevices())
        .then((devices) => {
          const videoDevices = devices.filter((d) => d.kind === "videoinput");
          const preferred = videoDevices.find((d) =>
            /hd|rgb|webcam/i.test(d.label)
          );
          setDeviceId(preferred?.deviceId || videoDevices[0]?.deviceId || "");
        })
        .catch(() => {
          console.warn("Webcam access denied or unavailable.");
        });
    }, []);

    useEffect(() => {
      if (
        typeof forwardedVideoRef === "function" &&
        webcamComponentRef.current?.video
      ) {
        forwardedVideoRef(webcamComponentRef.current.video);
      } else if (
        forwardedVideoRef &&
        typeof forwardedVideoRef === "object" &&
        "current" in forwardedVideoRef
      ) {
        forwardedVideoRef.current = webcamComponentRef.current?.video || null;
      }
    }, []);

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
        className={webcamActive ? "" : "bg-dark"}
        style={{
          width: "100%",
          height: "100%",
          transform: mirrored ? "scaleX(-1)" : "none",
        }}
      >
        {webcamActive && deviceId && (
          <WebcamDefault
            key={deviceId + String(webcamActive)}
            audio={false}
            ref={webcamComponentRef}
            mirrored={mirrored}
            videoConstraints={{
              deviceId: { exact: deviceId },
              // width: { ideal: width },
              // height: { ideal: height },
              facingMode: "user",
            }}
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

export default WebcamFeed;
