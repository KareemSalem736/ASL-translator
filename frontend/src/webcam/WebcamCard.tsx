import VideoControls from "./VideoControls";
import WebcamFeed from "./WebcamFeed";
import { useWebcam } from "./WebcamContext";
import Card from "../components/Card";

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
    <Card
      className="overflow-hidden position-relative"
      cameraViewPort={
        <>
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
        </>
      }
    ></Card>
  );
};

export default WebcamCard;
