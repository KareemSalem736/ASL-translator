import { useEffect, useRef, useState } from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import SignInModal from "../components/Modals/SignInModal";
import SettingsModal from "../components/Modals/SettingsModal";
import SignUpModal from "../components/Modals/SignUpModal";
import ForgotPasswordModal from "../components/Modals/ForgotPasswordModal";
import { useMediaPipeHands } from "../components/ML/MediapipeLogic";
import type { WebcamFeedHandle } from "../components/Webcam/WebcamFeed";
import WebcamFeed from "../components/Webcam/WebcamFeed";

const MainPage = () => {
  const [activeModal, setActiveModal] = useState<
    null | "login" | "profile" | "settings" | "signup" | "forgotPassword"
  >(null);
  const [lastGesture, setLastGesture] = useState<string | null>(null);

  const webcamRef = useRef<WebcamFeedHandle>(null);

  const canvasRef = useMediaPipeHands(
    () => webcamRef.current?.getVideoElement() || null,
    (landmarks) => console.log("Landmarks:", landmarks),
    () => webcamRef.current?.getCanvasElement() || null
    // (gesture: string) => {
    //   setTimeout(() => {
    //     setGestureMeta({ name: gesture, ts: Date.now() });
    //   }, 0);
    // }
  );

  const closeModal = () => setActiveModal(null);

  const [gestureMeta, setGestureMeta] = useState<{
    name: string;
    ts: number;
  } | null>(null);

  return (
    <div className="d-flex flex-column vh-100">
      <Header
        onLoginClick={() => setActiveModal("login")}
        onProfileClick={() => setActiveModal("profile")}
        onSettingsClick={() => setActiveModal("settings")}
      />

      {/* Modals */}
      <SignInModal
        open={activeModal === "login"}
        onClose={closeModal}
        onSignupClick={() => setActiveModal("signup")}
        onForgotPasswordClick={() => setActiveModal("forgotPassword")}
      />
      <SignUpModal
        open={activeModal === "signup"}
        onClose={closeModal}
        onSignInClick={() => setActiveModal("login")}
      />
      <ForgotPasswordModal
        open={activeModal === "forgotPassword"}
        onClose={closeModal}
        onSignInClick={() => setActiveModal("login")}
      />
      <SettingsModal open={activeModal === "settings"} onClose={closeModal} />

      <main className="flex-grow-1 container-fluid">
        <div className="row h-100">
          <div className="col-8 d-flex flex-column h-100">
            <div className="position-relative border rounded p-3 mb-3 bg-light h-75 shadow rounded-4">
              <WebcamFeed ref={webcamRef} />
              {/* 🔽 Optional fallback canvas (only used if overlay is enabled) */}
              <canvas
                ref={canvasRef}
                className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
              />
            </div>
            <div className="d-flex justify-content-center align-items-center border rounded p-3 bg-white mt-auto h-25 shadow rounded-4">
              <p className="m-auto">
                Detected gesture: <strong>{lastGesture ?? "None"}</strong>
              </p>
            </div>
          </div>
          <div className="col-4 d-flex flex-column h-100">
            <div className="d-flex justify-content-center align-items-center border rounded p-3 mb-3 bg-light h-75 shadow rounded-4">
              <p className="m-auto">Prediction History</p>
            </div>
            <div className="d-flex justify-content-center align-items-center border rounded p-3 bg-white mt-auto h-25 shadow rounded-4">
              <p className="m-auto">Model Confidence</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
