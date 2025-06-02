import { useState } from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import WebcamFeed from "../components/Webcam/WebcamFeed";
import SignInModal from "../components/Modals/SignInModal";
import SettingsModal from "../components/Modals/SettingsModal";
import SignUpModal from "../components/Modals/SignUpModal";
import ForgotPasswordModal from "../components/Modals/ForgotPasswordModal";
// import ProfileModal from "../components/Modals/ProfileModal";

const MainPage = () => {
  const [activeModal, setActiveModal] = useState<
    null | "login" | "profile" | "settings" | "signup" | "forgotPassword"
  >(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="d-flex flex-column vh-100 flex-row-sm container">
      <Header
        onLoginClick={() => setActiveModal("login")}
        onProfileClick={() => setActiveModal("profile")}
        onSettingsClick={() => setActiveModal("settings")}
      />

      {/* Modals */}
      <SignInModal
        open={activeModal === "login"}
        onClose={() => setActiveModal(null)}
        onSignupClick={() => setActiveModal("signup")}
        onForgotPasswordClick={() => setActiveModal("forgotPassword")}
      />

      <SignUpModal
        open={activeModal === "signup"}
        onClose={() => setActiveModal(null)}
        onSignInClick={() => setActiveModal("login")}
      />

      <ForgotPasswordModal
        open={activeModal === "forgotPassword"}
        onClose={() => setActiveModal(null)}
        onSignInClick={() => setActiveModal("login")}
      />

      {/* <ProfileModal open={activeModal === "profile"} onClose={closeModal} /> */}
      <SettingsModal open={activeModal === "settings"} onClose={closeModal} />

      <main className="flex-grow-1 pb-3">
        {/* Row 1: WebcamFeed and Prediction History */}
        <div className="row h-75 mb-3">
          {/* WebcamFeed */}
          <div className="col-md-8 col-sm-12 d-flex flex-column h-100">
            <div className="d-flex justify-content-center align-items-center bg-light h-100 shadow rounded-4">
              <WebcamFeed />
            </div>
          </div>

          {/* Prediction History */}
          <div className="col-md-4 d-sm-none d-md-flex flex-column h-100">
            <div className="d-flex justify-content-center align-items-center bg-light h-100 shadow rounded-4">
              <p className="m-auto">Prediction History</p>
            </div>
          </div>
        </div>

        {/* Row 2: Translated Output and Model Stats */}
        <div className="row h-25">
          {/* Translated Output */}
          <div className="col-8 d-flex flex-column h-100">
            <div className="d-flex justify-content-center align-items-center bg-white h-100 shadow rounded-4">
              <p className="m-auto">Translated output (editable)</p>
            </div>
          </div>

          {/* Model Stats */}
          <div className="col-4 d-flex flex-column h-100">
            <div className="d-flex justify-content-center align-items-center bg-white h-100 shadow rounded-4">
              <p className="m-auto">Model Stats</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;

{
  /* <main className="flex-grow-1 container-md w-100">
<div className="row h-100">
  <div className="col-8 d-flex flex-column h-100">
    <div className="d-flex justify-content-center align-items-center  mb-3 bg-light h-75 shadow rounded-4">
      <WebcamFeed />
    </div>
    <div className="d-flex justify-content-center align-items-center  bg-white mt-auto h-25 shadow rounded-4">
      <p className="m-auto">Translated output (editable)</p>
    </div>
  </div>
  <div className="col-4 d-flex flex-column h-100">
    <div className="d-flex justify-content-center align-items-center  mb-3 bg-light h-75 shadow rounded-4">
      <p className="m-auto">Prediction History</p>
    </div>
    <div className="d-flex justify-content-center align-items-center  bg-white mt-auto h-25 shadow rounded-4">
      <p className="m-auto">Modal Stats</p>
    </div>
  </div>
</div>
</main> */
}
