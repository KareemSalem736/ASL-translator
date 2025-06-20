import VideoControls from "./VideoControls";
import WebcamFeed from "./WebcamFeed";
import { useWebcam } from "../WebcamContext";

interface WebcamCardProps {
  onPredictionResult: (res: any) => void;
}

const WebcamCard = ({ onPredictionResult }: WebcamCardProps) => {
  const {
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
  } = useWebcam();

  return (
    <div className="d-flex flex-column h-100 shadow rounded-4 position-relative">
      <WebcamFeed onPredictionResult={onPredictionResult} />
      <VideoControls
        webcamActive={webcamActive}
        setWebcamActive={setWebcamActive}
        mirrored={mirrored}
        setMirrored={setMirrored}
        showLandmarks={showLandmarks}
        setShowLandmarks={setShowLandmarks}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        showPrediction={showPrediction}
        setShowPrediction={setShowPrediction}
      />
    </div>
  );
};

export default WebcamCard;
