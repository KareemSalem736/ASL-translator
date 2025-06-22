// This component renders a control bar for the webcam video feed.
// It includes buttons to start/stop the webcam, toggle mirroring, show/hide landmarks,
// toggle fullscreen mode, and enable/disable predictions (API calls).
// Each button has an icon and a click handler to toggle the respective state.

import Button from "../../components/Button/Button";

interface VideoControlsProps {
  webcamActive: boolean; // Whether the webcam is currently active
  setWebcamActive: (b: boolean) => void;
  mirrored: boolean; // Whether the video feed is mirrored
  setMirrored: (b: boolean) => void;
  showLandmarks: boolean; // Whether to show landmarks on the video feed
  setShowLandmarks: (b: boolean) => void;
  isFullscreen: boolean; // Whether the video feed is in fullscreen mode
  setIsFullscreen: (b: boolean) => void;
  showPrediction: boolean; // Whether make API calls to backend for predictions
  setShowPrediction: (b: boolean) => void;
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
    <div className="control-bar d-flex flex-row gap-2 p-2 position-absolute bottom-0 bg-black bg-opacity-25 rounded-4">
      {/* Start/Stop */}
      <Button
        tooltip={webcamActive ? "Stop camera" : "Start camera"}
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
      <Button
        tooltip={mirrored ? "Un-mirror video" : "Mirror video"}
        className=" border-0 btn-sm btn-outline-light"
        onClick={() => setMirrored(!mirrored)}
      >
        {mirrored ? (
          <i className="bi bi-layout-sidebar" style={{ fontSize: "1.25rem" }} />
        ) : (
          <i
            className="bi bi-layout-sidebar-reverse"
            style={{ fontSize: "1.25rem" }}
          />
        )}
      </Button>

      {/* Toggle Landmarks */}
      <Button
        tooltip={showLandmarks ? "Hide landmarks" : "Show landmarks"}
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
      <Button
        tooltip={showPrediction ? "Stop predictions" : "Start predictions"}
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
      </Button>

      {/* Toggle Fullscreen */}
      <Button
        tooltip={isFullscreen ? "Exit full-screen" : "Enter full-screen"}
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
      </Button>
    </div>
  );
};

export default VideoControls;
