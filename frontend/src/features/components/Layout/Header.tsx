// ─── Header Component ───
// This component renders the header with buttons for login, profile, settings, and GitHub link.
// It accepts a single callback functions as props for onSettingsClick.
// Authentication modal such es signin, sinup, forgotpassword as well as profile modal following
// separation of concern design pattern
// The header has a fixed height of 64px
// The GitHub button opens the repository in a new tab.

import { useState } from "react";
import Button from "../Button/Button";
import SignInModal from "../../auth/modals/SignInModal";
import SignUpModal from "../../auth/modals/SignUpModal";
import ForgotPasswordModal from "../../auth/modals/ForgotPasswordModal";

interface HeaderProps {
  onSettingsClick?: () => void;
}

const Header = ({ onSettingsClick }: HeaderProps) => {
  const [activeAuthModal, setActiveAuthModal] = useState<
    null | "login" | "signup" | "forgotPassword" | "profile"
  >(null);

  function closeModal() {
    setActiveAuthModal(null);
  }

  return (
    <>
      <header className="px-2 my-1 rounded-5" style={{ height: "64px" }}>
        <div className="d-flex justify-content-end align-items-center h-100 gap-2">
          <Button
            className="border"
            onClick={() => setActiveAuthModal("login")}
            aria-label="Login"
          >
            <p className="m-0 fs-5">LogIn</p>
          </Button>
          <Button
            className="border"
            onClick={() => setActiveAuthModal("profile")}
            aria-label="Profile"
          >
            <i className="bi bi-person-fill fs-4"></i>
          </Button>

          {onSettingsClick && (
            <Button
              className="border"
              onClick={onSettingsClick}
              aria-label="Settings"
            >
              <i className="bi bi-gear-fill fs-4"></i>
            </Button>
          )}
          <Button
            className="border"
            href="https://github.com/KareemSalem736/ASL-translator/"
            target="_blank"
            aria-label="GitHub"
          >
            <i className="bi bi-github fs-4"></i>
          </Button>
        </div>
      </header>

      {/* Modals */}
      <SignInModal
        open={activeAuthModal === "login"}
        onClose={closeModal}
        onSignupClick={() => setActiveAuthModal("signup")}
        onForgotPasswordClick={() => setActiveAuthModal("forgotPassword")}
      />
      <SignUpModal
        open={activeAuthModal === "signup"}
        onClose={closeModal}
        onSignInClick={() => setActiveAuthModal("login")}
      />
      <ForgotPasswordModal
        open={activeAuthModal === "forgotPassword"}
        onClose={closeModal}
        onSignInClick={() => setActiveAuthModal("login")}
      />

      {/* Profile Modal here */}
    </>
  );
};

export default Header;
