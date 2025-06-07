// This component renders a settings modal with options for dark mode and clearing translation history.
// The `open` prop controls the visibility of the modal, and `onClose` is a callback function to close it.
// The modal includes two buttons: one for toggling dark mode and another for clearing translation history.
// You can add functionality to these buttons later as needed.
// The modal is styled with Bootstrap classes and includes a close button.

import Button from "../Buttons/Button";
import Modal from "./Modal";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

const Settings = ({ open, onClose }: SettingsProps) => {
  if (!open) return null;
  return (
    <Modal onClose={onClose} open={open} title="Settings">
      <div className="d-flex flex-column gap-2">
        <Button className="btn text-start p-3">
          <i className="bi bi-moon-fill me-2"></i>Dark Mode
        </Button>
        <Button className="btn text-start p-3">
          <i className="bi bi-trash-fill me-2 text-danger"></i>Clear Translation
          History
        </Button>
      </div>
    </Modal>
  );
};

export default Settings;
