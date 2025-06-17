import React, { useCallback, useState } from "react";
import Footer from "../features/components/Layout/Footer";
import Header from "../features/components/Layout/Header";
import ModelStatisticsCard from "../features/prediction/components/ModelStatisticsCard";
import TranslatedOutputCard from "../features/prediction/components/TranslatedOutputCard";
import PredictionHistoryCard from "../features/prediction/components/PredictionHistoryCard";
import type { PredictionResponse } from "../features/prediction/api/predictionAPI";
import SettingsModal from "../features/settings/modals/SettingsModal";
import WebcamCard from "../features/webcam/components/WebcamCard";

const MainPage: React.FC = () => {
  const [activeModal, setActiveModal] = useState<null | "settings">(null);
  const closeModal = () => setActiveModal(null);

  const [translatedText, setTranslatedText] = useState("");

  const [modelStats, setModelStats] = useState<PredictionResponse | null>(null);

  const handlePredictionResult = useCallback((res: PredictionResponse) => {
    setTranslatedText((prev) => prev + res.prediction);
    setModelStats(res);
  }, []);

  const onPrediction = useCallback(
    (res: PredictionResponse) => {
      handlePredictionResult(res);
    },
    [handlePredictionResult]
  );

  return (
    <div className="d-flex flex-column vh-100 flex-row-sm container">
      <Header onSettingsClick={() => setActiveModal("settings")} />
      <SettingsModal open={activeModal === "settings"} onClose={closeModal} />

      <main className="flex-grow-1 pb-3">
        <div className="row h-75 mb-3">
          <div className="col-md-8 col-sm-12 d-flex flex-column h-100">
            {/* <WebcamProvider> */}
            <WebcamCard onPredictionResult={onPrediction} />
            {/* </WebcamProvider> */}
          </div>

          <div className="col-md-4 d-sm-none d-md-flex flex-column h-100">
            <PredictionHistoryCard />
          </div>
        </div>

        <div className="row h-25">
          <div className="col-8 d-flex flex-column h-100">
            <TranslatedOutputCard
              translatedText={translatedText}
              setTranslatedText={() => setTranslatedText("")}
            />
          </div>

          <div className="col-4 d-flex flex-column h-100">
            <ModelStatisticsCard stats={modelStats} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;
