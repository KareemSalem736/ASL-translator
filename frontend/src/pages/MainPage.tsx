import { useState } from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import WebcamFeed from "../components/Webcam/WebcamFeed";
import SignInModal from "../components/Modals/SignInModal";
import SettingsModal from "../components/Modals/SettingsModal";
// import ProfileModal from "../components/Modals/ProfileModal";

const MainPage = () => {
  const [activeModal, setActiveModal] = useState<
    null | "login" | "profile" | "settings"
  >(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="d-flex flex-column vh-100">
      <Header
        onLoginClick={() => setActiveModal("login")}
        onProfileClick={() => setActiveModal("profile")}
        onSettingsClick={() => setActiveModal("settings")}
      />

      {/* Modals */}
      <SignInModal open={activeModal === "login"} onClose={closeModal} />
      {/* <ProfileModal open={activeModal === "profile"} onClose={closeModal} /> */}
      <SettingsModal open={activeModal === "settings"} onClose={closeModal} />

      <main className="flex-grow-1 container-fluid">
        <div className="row h-100">
          <div className="row h-100">
            <div className="col-8 d-flex flex-column h-100">
              <div className="d-flex justify-content-center align-items-center border rounded p-3 mb-3 bg-light h-75 shadow rounded-4">
                <WebcamFeed />
              </div>
              <div className="d-flex justify-content-center align-items-center border rounded p-3 bg-white mt-auto h-25 shadow rounded-4">
                <p className="m-auto">Translated output</p>
              </div>
            </div>
            <div className="col-4 d-flex flex-column h-100">
              <div className="d-flex justify-content-center align-items-center border rounded p-3 mb-3 bg-light h-75 shadow rounded-4">
                <p className="m-auto">Prediction History</p>
              </div>
              <div className="d-flex justify-content-center align-items-center border rounded p-3 bg-white mt-auto h-25 shadow rounded-4">
                <p className="m-auto">Modal Confidence</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
