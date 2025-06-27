// // This component renders a webcam feed with a canvas overlay for hand tracking.
// // It uses the `useHandTracking` hook to handle the hand tracking logic.
// // The webcam feed is only active when `isActive` is true, and it uses the `Webcam` component from `react-webcam`.
// // The canvas is used to draw landmarks and predictions on top of the webcam feed.

import { forwardRef, useEffect, useRef } from "react";
import type { PredictionResponse } from "../prediction/predictionAPI";
import { useHandTracking } from "../prediction/useHandTracking";
import { useWebcam } from "./WebcamContext.tsx";

export interface WebcamFeedProps {
  width?: number;
  height?: number;
  onPredictionResult: (res: PredictionResponse) => void;
}

const WebcamFeed = forwardRef<HTMLVideoElement, WebcamFeedProps>(
  ({ width = 1280, height = 720, onPredictionResult }, forwardedVideoRef) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const {
      webcamActive,
      setWebcamActive,
      mirrored,
      showLandmarks,
      showPrediction,
      mediaStream,
      setMediaStream,
    } = useWebcam();

    useEffect(() => {
      if (webcamActive && !mediaStream) {
        if (navigator.mediaDevices) {
            navigator.mediaDevices
                .getUserMedia({video: true})
                .then((stream) => {
                    setMediaStream(stream);
                })
                .catch((err) => {
                    setWebcamActive(false);
                    console.error("Camera access denied or unavailable", err);
                });
        } else {
            setWebcamActive(false);
            console.error("Camera access denied or unavailable")
        }
      }

      if (!webcamActive && mediaStream) {
        // Stop all media tracks
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });

        setMediaStream(null);
      }
    }, [webcamActive]);

    // Attach stream to video element
    useEffect(() => {
      if (videoElementRef.current && mediaStream) {
        videoElementRef.current.srcObject = mediaStream;
        videoElementRef.current.play().catch(console.error);
      }
    }, [mediaStream]);

    // Pass video element ref upward
    useEffect(() => {
      if (typeof forwardedVideoRef === "function" && videoElementRef.current) {
        forwardedVideoRef(videoElementRef.current);
      } else if (
        forwardedVideoRef &&
        typeof forwardedVideoRef === "object" &&
        "current" in forwardedVideoRef
      ) {
        forwardedVideoRef.current = videoElementRef.current;
      }
    }, []);

    // Hand tracking
    useHandTracking({
      videoComponentRef: videoElementRef,
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
        <video
          className="d-none"
          ref={videoElementRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: webcamActive ? "block" : "none",
          }}
        />
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
