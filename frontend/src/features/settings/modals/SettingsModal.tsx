// This component renders a settings modal with options for dark mode and clearing translation history.
// The `open` prop controls the visibility of the modal, and `onClose` is a callback function to close it.
// The modal includes two buttons: one for toggling dark mode and another for clearing translation history.
// You can add functionality to these buttons later as needed.
// The modal is styled with Bootstrap classes and includes a close button.

// src/features/settings/modals/SettingsModal.tsx

import Button from "../../components/Button/Button";
import Modal from "../../components/Modal/Modal";
import { useSettings } from "../hooks/useSettings";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal = ({ open, onClose }: SettingsProps) => {
  const {
    darkMode,
    toggleDarkMode,
    toggleWebcam,
    togglePrediction,
    webcamEnabled,
    predictionEnabled,
  } = useSettings();

  if (!open) return null;

  return (
    <Modal onClose={onClose} open={open} title="Settings">
      <div className="d-flex flex-column gap-2">
        <Button className="btn text-start p-3" onClick={toggleDarkMode}>
          <i
            className={`bi ${darkMode ? "bi-sun-fill" : "bi-moon-fill"} me-2`}
          />
          {darkMode ? "Light Mode" : "Dark Mode"}
        </Button>

        <Button className="btn text-start p-3" onClick={toggleWebcam}>
          <i className="bi bi-camera-video-fill me-2" />
          {webcamEnabled ? "Disable Webcam" : "Enable Webcam"}
        </Button>

        <Button className="btn text-start p-3" onClick={togglePrediction}>
          <i className="bi bi-cpu-fill me-2" />
          {predictionEnabled ? "Disable Prediction" : "Enable Prediction"}
        </Button>

        <Button className="btn text-start p-3 text-danger">
          <i className="bi bi-trash-fill me-2" />
          Clear Translation History
        </Button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
