// ─── Header Component ───
// This component renders the header with buttons for login, profile, settings, and GitHub link.
// It accepts three callback functions as props: onLoginClick, onProfileClick, and onSettingsClick.
// The header has a fixed height of 64px and a white background.
// The GitHub button opens the repository in a new tab.

import Button from "../Buttons/Button";

interface HeaderProps {
  onLoginClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

const Header = ({
  onLoginClick,
  onProfileClick,
  onSettingsClick,
}: HeaderProps) => {
  return (
    <header className="bg-white" style={{ height: "64px" }}>
      <div className="d-flex justify-content-end align-items-center h-100 gap-2">
        <Button className="border" onClick={onLoginClick}>
          <p className="m-0 fs-5">LogIn</p>
        </Button>
        <Button className="border" onClick={onProfileClick}>
          <i className="bi bi-person-fill fs-4"></i>
        </Button>
        <Button className="border" onClick={onSettingsClick}>
          <i className="bi bi-gear-fill fs-4"></i>
        </Button>
        <Button
          className="border"
          href="https://github.com/KareemSalem736/ASL-translator/"
          target="_blank"
        >
          <i className="bi bi-github fs-4"></i>
        </Button>
      </div>
    </header>
  );
};

export default Header;
