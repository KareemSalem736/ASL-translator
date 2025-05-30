import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Webcam from "react-webcam";

export type WebcamFeedHandle = {
  getVideoElement: () => HTMLVideoElement | null;
  getCanvasElement: () => HTMLCanvasElement | null;
  isWebcamActive: () => boolean;
};

const videoConstraints = {
  width: 1280,
  height: 720,
};

const WebcamFeed = forwardRef<WebcamFeedHandle>((_, ref) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useImperativeHandle(ref, () => ({
    getVideoElement: () => (isActive ? webcamRef.current?.video ?? null : null),
    getCanvasElement: () => (showOverlay ? canvasRef.current ?? null : null),
    isWebcamActive: () => isActive,
  }));

  const toggleWebcam = () => {
    if (isActive && webcamRef.current?.stream) {
      webcamRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsActive((prev) => !prev);
  };

  const toggleOverlay = () => {
    setShowOverlay((prev) => !prev);
  };

  return (
    <div className="position-relative w-100 h-100">
      {isActive && (
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={videoConstraints}
          className="w-100 h-100 object-fit-cover rounded-4 border"
        />
      )}

      {isActive && showOverlay && (
        <canvas
          ref={canvasRef}
          className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
        />
      )}

      <div className="position-absolute top-0 start-0 w-100 d-flex justify-content-start gap-2 p-2 z-3">
        <button className="btn btn-dark" onClick={toggleWebcam}>
          {isActive ? (
            <>
              <i className="bi bi-camera-video-off me-2"></i>
              Stop Webcam
            </>
          ) : (
            <>
              <i className="bi bi-camera-video me-2"></i>
              Start Webcam
            </>
          )}
        </button>

        {isActive && (
          <button className="btn btn-outline-light" onClick={toggleOverlay}>
            {showOverlay ? (
              <>
                <i className="bi bi-eye-slash me-2"></i>
                Hide Overlay
              </>
            ) : (
              <>
                <i className="bi bi-eye me-2"></i>
                Show Overlay
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});

export default WebcamFeed;
