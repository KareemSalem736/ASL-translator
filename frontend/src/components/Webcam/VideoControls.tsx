// src/components/Webcam/VideoControls.tsx
import React from "react";
import Button from "../Buttons/Button";

interface VideoControlsProps {
  webcamActive: boolean;
  setWebcamActive: (b: boolean) => void;
  mirrored: boolean;
  setMirrored: (b: boolean) => void;
  showLandmarks: boolean;
  setShowLandmarks: (b: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (b: boolean) => void;

  showPrediction: boolean; // ← NEW
  setShowPrediction: (b: boolean) => void; // ← NEW
}

const VideoControls: React.FC<VideoControlsProps> = ({
  webcamActive,
  setWebcamActive,
  mirrored,
  setMirrored,
  showLandmarks,
  setShowLandmarks,
  isFullscreen,
  setIsFullscreen,
  showPrediction,
  setShowPrediction,
}) => {
  return (
    <div className="control-bar d-flex flex-row gap-2 p-2 position-absolute bottom-0 bg-black bg-opacity-25 rounded-pill">
      {/* Start/Stop */}
      <Button
        className=" border-0 btn-sm btn-outline-light"
        onClick={() => setWebcamActive(!webcamActive)}
      >
        {webcamActive ? (
          <i
            className="bi bi-camera-video-off"
            style={{ fontSize: "1.25rem" }}
          />
        ) : (
          <i className="bi bi-camera-video" style={{ fontSize: "1.25rem" }} />
        )}
      </Button>

      {/* Toggle Mirror */}
      {/* <Button
        className=" border-0 btn-sm btn-outline-light"
        onClick={() => setMirrored(!mirrored)}
      >
        {mirrored ? (
          <i
            className="bi bi-symmetry-vertical"
            style={{ fontSize: "1.25rem" }}
          />
        ) : (
          <i className="bi bi-eye" style={{ fontSize: "1.25rem" }} />
        )}
      </Button> */}

      {/* Toggle Landmarks */}
      <Button
        className=" border-0 btn-sm btn-outline-light"
        onClick={() => setShowLandmarks(!showLandmarks)}
      >
        {showLandmarks ? (
          <i className="bi bi-eye-slash" style={{ fontSize: "1.25rem" }} />
        ) : (
          <i className="bi bi-eye" style={{ fontSize: "1.25rem" }} />
        )}
      </Button>

      {/* ◉ Toggle Prediction (API calls) */}
      {/* <Button
        className=" border-0 btn-sm btn-outline-light"
        onClick={() => setShowPrediction(!showPrediction)}
      >
        {showPrediction ? (
          <i
            className="bi bi-stop"
            title="Disable Prediction"
            style={{ fontSize: "1.25rem" }}
          />
        ) : (
          <i
            className="bi bi-play"
            title="Enable Prediction"
            style={{ fontSize: "1.25rem" }}
          />
        )}
      </Button> */}

      {/* Toggle Fullscreen */}
      {/* <Button
        className=" border-0 btn-sm btn-outline-light"
        onClick={() => setIsFullscreen(!isFullscreen)}
      >
        {isFullscreen ? (
          <i
            className="bi bi-fullscreen-exit"
            style={{ fontSize: "1.25rem" }}
          />
        ) : (
          <i className="bi bi-fullscreen" style={{ fontSize: "1.25rem" }} />
        )}
      </Button> */}
    </div>
  );
};

export default VideoControls;
