// ─── Header Component ───
// This component renders the header with buttons for login and GitHub.
// It handles authentication modals: login, signup, and forgot password.

import { useState } from "react";
import Button from "./components/Button";
import SignInModal from "./auth/SignInModal";
import SignUpModal from "./auth/SignUpModal";
import ForgotPasswordModal from "./auth/ForgotPasswordModal";
import ProfileModal from "./auth/ProfileModal.tsx";

interface HeaderProps {
    isLoading: boolean;
    isAuthenticated: boolean;
}

const Header = ({
                    isLoading,
                    isAuthenticated
                }: HeaderProps) => {
  const [activeAuthModal, setActiveAuthModal] = useState<
    null | "login" | "signup" | "profile" | "forgotPassword"
  >(null);

  const closeModal = () => setActiveAuthModal(null);

  return (
    <>
      <header className="px-2 my-1 rounded-5" style={{ height: "64px" }}>
        <div className="d-flex justify-content-end align-items-center h-100 gap-2">
            {!isLoading && (!isAuthenticated ? (
                <Button
                    className="border"
                    onClick={() => setActiveAuthModal("login")}
                    aria-label="Login">
                    <p className="m-0 fs-5">Log In</p>
                </Button>
            ) : (
                <Button
                    className="border"
                    onClick={() => setActiveAuthModal("profile")}
                    aria-label="Profile">
                    <p className="m-0 fs-5">Profile</p>
                </Button>
                )
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
      <ProfileModal
        open={activeAuthModal === "profile"}
        onClose={closeModal}
      />
      <ForgotPasswordModal
        open={activeAuthModal === "forgotPassword"}
        onClose={closeModal}
        onSignInClick={() => setActiveAuthModal("login")}
      />
    </>
  );
};

export default Header;
