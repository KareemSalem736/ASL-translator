// // This component renders a webcam feed with a canvas overlay for hand tracking.
// // It uses the `useHandTracking` hook to handle the hand tracking logic.
// // The webcam feed is only active when `isActive` is true, and it uses the `Webcam` component from `react-webcam`.
// // The canvas is used to draw landmarks and predictions on top of the webcam feed.

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import type { PredictionResponse } from "../prediction/predictionAPI";
import { useHandTracking } from "../prediction/useHandTracking";
import { useWebcam } from "../webcam/WebcamContext";
import Button from "../components/Button";
import { useStatusManager, type Status } from "./WebcamStatus";

export interface WebcamFeedProps {
  width?: number;
  height?: number;
  onPredictionResult: (res: PredictionResponse) => void;
}

const WebcamFeed = forwardRef<HTMLVideoElement, WebcamFeedProps>(
  ({ width = 1280, height = 720, onPredictionResult }, forwardedVideoRef) => {
    const webcamRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const {
      webcamActive,
      mirrored,
      showLandmarks,
      showPrediction,
      setWebcamActive,
    } = useWebcam();

    const [videoReady, setVideoReady] = useState(false);
    const [permissionRequested, setPermissionRequested] = useState(false);
    const [webcamKey, setWebcamKey] = useState(0);
    const [status, setStatus] = useState<Status | null>({
      icon: "camera-video",
      text: "Waiting to start...",
      variant: "text-secondary",
    });
    const statusActions = useStatusManager(setStatus);

    // current prediction feedback
    const handlePrediction = (res: PredictionResponse) => {
      if (res?.prediction) {
        setStatus({
          icon: "brain",
          text: `Predicting: ${res.prediction} (${Math.round(
            res.confidence * 100
          )}%)`,
          variant: "text-info",
        });
      } else {
        setStatus({
          icon: "x-octagon",
          text: "Prediction failed",
          variant: "text-danger",
        });
      }
      onPredictionResult(res);
    };

    // camera off feedback hook
    useEffect(() => {
      if (!webcamActive) {
        setVideoReady(false);
        setPermissionRequested(false);
        setStatus({
          icon: "camera-video-off",
          text: "Camera turned off",
          variant: "text-white",
        });
      }
    }, [webcamActive]);

    //  camera on  feedback hook
    useEffect(() => {
      if (!webcamActive) return;

      const checkReady = () => {
        const video = webcamRef.current?.video;
        if (
          video &&
          video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA &&
          video.videoWidth > 0
        ) {
          setVideoReady(true);
          setStatus({
            icon: "camera-video",
            text: "Camera ready",
            variant: "text-success",
          });

          if (forwardedVideoRef) {
            if (typeof forwardedVideoRef === "function") {
              forwardedVideoRef(video);
            } else {
              forwardedVideoRef.current = video;
            }
          }
          return true;
        }
        return false;
      };

      const interval = setInterval(() => {
        if (checkReady()) clearInterval(interval);
      }, 100);

      return () => clearInterval(interval);
    }, [webcamActive, forwardedVideoRef]);

    // prediction button toggle feedback hook
    useEffect(() => {
      if (!webcamActive || !videoReady) return;

      if (showPrediction) {
        statusActions.setPredictionEnabled();
      } else {
        statusActions.setPredictionDisabled();
      }
    }, [showPrediction, webcamActive, videoReady]);

    useHandTracking({
      videoComponentRef: webcamRef.current?.video
        ? { current: webcamRef.current.video }
        : { current: null },
      canvasRef,
      onPredictionResult: handlePrediction,
      isActive: webcamActive && videoReady,
      width,
      height,
      showLandmarks,
      showPrediction,
    });

    return (
      <div
        className={`position-relative d-flex w-100 h-100 ${
          webcamActive && videoReady ? "" : "bg-dark"
        }`}
      >
        {!webcamActive && (
          <Button
            className="btn-outline-light m-auto"
            onClick={() => {
              setPermissionRequested(true);
              setWebcamActive(true);
              setWebcamKey((prev) => prev + 1);
              setStatus({
                icon: "camera-video",
                text: "Requesting camera access...",
                variant: "text-warning",
              });
            }}
          >
            <i className="bi bi-camera-video me-2" />
            Allow Camera Access
          </Button>
        )}

        {webcamActive && !videoReady && (
          <span className="text-white m-auto d-flex flex-column gap-3 align-items-baseline">
            <div
              className=" spinner-border m-auto"
              style={{ width: "150px", height: "150px" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading webcam or waiting for permissions...</p>
          </span>
        )}

        {(webcamActive || permissionRequested) && (
          <Webcam
            key={webcamKey}
            ref={webcamRef}
            audio={false}
            mirrored={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "user", // front camera
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }}
            onUserMedia={() => {
              setVideoReady(true);
              setStatus({
                icon: "camera-video",
                text: "Camera stream active",
                variant: "text-success",
              });
            }}
            onUserMediaError={(err) => {
              console.error("Webcam access error:", err);

              let errorName = "UnknownError";

              if (err && typeof err === "object" && "name" in err) {
                errorName = (err as DOMException).name;
              }

              let errorMessage = "Webcam error: access denied or unavailable";

              switch (errorName) {
                case "NotAllowedError":
                case "PermissionDeniedError":
                  errorMessage =
                    "Permission denied. Please enable camera access in your browser settings.";
                  break;
                case "NotFoundError":
                case "OverconstrainedError":
                  errorMessage = "No camera found or doesn't meet constraints.";
                  break;
                case "NotReadableError":
                  errorMessage =
                    "Camera is already in use by another application.";
                  break;
                case "AbortError":
                  errorMessage = "Camera access aborted unexpectedly.";
                  break;
                case "SecurityError":
                  errorMessage =
                    "Camera access blocked. Ensure you're using HTTPS.";
                  break;
                default:
                  errorMessage = `Camera error: ${errorName}`;
              }

              console.error("Webcam access error:", err);
              setStatus({
                icon: "exclamation-triangle-fill",
                text: `Camera error: ${errorName} — ${errorMessage}`,
                variant: "text-danger",
              });
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              visibility: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        )}

        {videoReady && (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="position-absolute top-0 start-0 rounded-4"
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              display: "block",
              transform: mirrored ? "scaleX(-1)" : "none",
              transformOrigin: "center",
            }}
          />
        )}

        {/* Bootstrap Status Overlay */}

        {status && (
          <div
            className={`position-absolute bottom-0 end-0 m-2 px-3 py-2 bg-black bg-opacity-75 rounded-3 d-flex align-items-baseline gap-2 ${status.variant}`}
          >
            <i
              className={`bi bi-${status.icon}`}
              style={{ fontSize: "1.2rem" }}
            ></i>
            <span>{status.text}</span>
          </div>
        )}
      </div>
    );
  }
);

export default WebcamFeed;
