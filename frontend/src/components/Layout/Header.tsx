import Button from "../Button";

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
      <div className="d-flex justify-content-end align-items-center h-100 px-4 gap-2">
        <Button onClick={onLoginClick}>
          <p className="m-0 fs-5">LogIn</p>
        </Button>
        <Button onClick={onProfileClick}>
          <i className="bi bi-person-fill fs-4"></i>
        </Button>
        <Button onClick={onSettingsClick}>
          <i className="bi bi-gear-fill fs-4"></i>
        </Button>
        <Button
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
