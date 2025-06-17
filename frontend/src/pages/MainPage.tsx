// This component defines a MainPage for the ASL Live Translator app.
// It includes a header, footer, webcam feed, video controls, and modals for user authentication and settings.
// This page is the main interface for users to interact with the application.

import React, { useCallback, useRef, useState } from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import WebcamFeed from "../components/Webcam/WebcamFeed";
import VideoControls from "../components/Webcam/VideoControls";
import SignInModal from "../components/Modals/SignInModal";
import SettingsModal from "../components/Modals/SettingsModal";
import SignUpModal from "../components/Modals/SignUpModal";
import ForgotPasswordModal from "../components/Modals/ForgotPasswordModal";
import type { PredictionResponse } from "../api/predictionAPI";

const MainPage: React.FC = () => {
  // ─── Lifted state for modals ───
  // This state controls which modal is currently active/open.
  const [activeModal, setActiveModal] = useState<
    null | "login" | "profile" | "settings" | "signup" | "forgotPassword"
  >(null);
  const closeModal = () => setActiveModal(null);

  // ─── Lifted state for all controls ───
  const [webcamActive, setWebcamActive] = useState(false);
  const [mirrored, setMirrored] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ◉ NEW: Toggle whether “prediction” should be shown or suppressed
  const [showPrediction, setShowPrediction] = useState(true);

  // ─── Video ref in case you want to grab the <video> element ───
  const videoRef = useRef<HTMLVideoElement>(null);

  // ─── Translation text & model stats ───
  const [translatedText, setTranslatedText] = useState("");
  const [modelStats, setModelStats] = useState<Omit<
    PredictionResponse,
    "prediction"
  > | null>(null);

  // ─── The actual callback that runs when a prediction comes back ───
  const handlePredictionResult = useCallback((res: PredictionResponse) => {
      if(res.confidence * 100 > 80) {
          setTranslatedText((prev) => prev + res.prediction);
      }
      const {prediction, ...rest} = res;
      setModelStats(rest);
  }, []);

  // ◉ Wrapped callback: only invoke the “real” handler when showPrediction===true
  const onPrediction = useCallback(
    (res: PredictionResponse) => {
      if (showPrediction) {
        handlePredictionResult(res);
      }
      // if showPrediction===false, do nothing (i.e. suppress)
    },
    [showPrediction, handlePredictionResult]
  );

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

      <main className="flex-grow-1 pb-3">
        <div className="row h-75 mb-3">
          <div className="col-md-8 col-sm-12 d-flex flex-column h-100">
            <div
              className={`position-relative bg-light h-100 shadow rounded-4 overflow-hidden ${
                isFullscreen ? "fullscreen-override" : ""
              }`}
            >
              {/* ─── The SINGLE <WebcamFeed> ─── */}
              <WebcamFeed
                ref={videoRef}
                isActive={webcamActive}
                mirrored={mirrored}
                showLandmarks={showLandmarks}
                showPrediction={showPrediction} // ← NEW
                onPredictionResult={onPrediction} // ← use wrapped callback
              />

              {/* ─── Overlayed controls (pass all setters + new showPrediction) ─── */}
              <VideoControls
                webcamActive={webcamActive}
                setWebcamActive={setWebcamActive}
                mirrored={mirrored}
                setMirrored={setMirrored}
                showLandmarks={showLandmarks}
                setShowLandmarks={setShowLandmarks}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                showPrediction={showPrediction} // ← new
                setShowPrediction={setShowPrediction} // ← new
              />
            </div>
          </div>

          {/* Prediction History */}
          <div className="col-md-4 d-sm-none d-md-flex flex-column h-100">
            <div className="d-flex justify-content-center align-items-center bg-light h-100 shadow rounded-4">
              <p className="m-auto">Prediction History</p>
            </div>
          </div>
        </div>

        {/* Translated output / model stats */}
        <div className="row h-25">
          <div className="col-8 d-flex flex-column h-100">
            <div className="bg-white shadow rounded-4 p-0 overflow-auto flex-grow-1 d-flex flex-column">
              {/* Sticky header */}
              <div className="position-sticky top-0 bg-white border-bottom py-2 px-4">
                <span className="fw-bold text-primary">Translated Output:</span>
              </div>

              {/* Scrollable content */}
              <div className="p-4 pt-2 text-break">
                {translatedText ? (
                  translatedText
                ) : (
                  <span className="text-muted">No predictions yet.</span>
                )}
              </div>
            </div>
          </div>
          <div className="col-4 d-flex flex-column h-100">
            <div className="d-flex justify-content-center align-items-center bg-white h-100 shadow rounded-4 p-3">
              {modelStats ? (
                <div className="w-100">
                  {modelStats.accuracy !== undefined && (
                    <p>
                      <strong>Accuracy:</strong>{" "}
                      {(modelStats.accuracy * 100).toFixed(1)}%
                    </p>
                  )}
                  <p>
                    <strong>Confidence:</strong>{" "}
                    {(modelStats.confidence * 100).toFixed(1)}%
                  </p>
                  {modelStats.inferenceTimeMs !== undefined && (
                    <p>
                      <strong>Inference Time:</strong>{" "}
                      {modelStats.inferenceTimeMs} ms
                    </p>
                  )}
                  {modelStats.probabilities && (
                    <div>
                      <strong>Probabilities:</strong>
                      <ul className="list-unstyled mb-0">
                        {Object.entries(modelStats.probabilities).map(
                          ([label, prob]) => (
                            <li key={label}>
                              {label}: {(prob * 100).toFixed(1)}%
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="m-auto">Model Stats</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
