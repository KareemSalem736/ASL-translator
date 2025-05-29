import Button from "../Buttons/Button";
import Modal from "./Modal";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

const Settings = ({ open, onClose }: SettingsProps) => {
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
