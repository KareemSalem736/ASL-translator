import { useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  // facingMode: "user",
};

const WebcamFeed = () => {
  const webcamRef = useRef<Webcam>(null);
  const [isActive, setIsActive] = useState(true);

  const toggleWebcam = () => {
    if (isActive && webcamRef.current?.stream) {
      webcamRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsActive((prev) => !prev);
  };

  return (
    <div
      className={`position-relative w-100 h-100 rounded-4 p-0 m-0 overflow-hidden ${
        isActive ? "" : "bg-dark"
      }`}
    >
      {/* Only render Webcam when active */}
      {isActive && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-100 h-100 object-fit-cover rounded-4 border"
        />
      )}

      {/* Hover Overlay using Bootstrap only */}
      <div className="position-absolute top-0 start-0 w-100 h-100 rounded-4 d-flex align-items-center justify-content-center text-center text-white bg-black bg-opacity-50 opacity-0 hover-opacity-100 transition">
        <button
          className="btn btn-outline-light fs-1 rounded-4"
          onClick={toggleWebcam}
        >
          {isActive ? (
            <>
              <i className="bi bi-camera-video-off-fill"></i>
              <p className="fs-5 mb-0">Stop Webcam</p>
            </>
          ) : (
            <>
              <i className="bi bi-camera-video-fill"></i>
              <p className="fs-5 mb-0">Start Webcam</p>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WebcamFeed;
