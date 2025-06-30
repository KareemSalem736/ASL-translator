// This is the main App component that sets up the routing for the application.
// It uses React Router to define different routes for the application, including the main page, about page, and instructions page.

import { useCallback, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ModelStatisticsCard from "./prediction/ModelStatisticsCard";
import TranslatedOutputCard from "./prediction/TranslatedOutputCard";
import PredictionHistoryCard from "./prediction/PredictionHistoryCard";
import type { PredictionResponse } from "./prediction/predictionAPI";
import WebcamCard from "./webcam/WebcamCard";
import {useAuth} from "./auth/AuthProvider.tsx";

function App() {
  const [translatedText, setTranslatedText] = useState("");
  const [modelStats, setModelStats] = useState<PredictionResponse | null>(null);

  const { isAuthenticated, isLoading } = useAuth();

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
      <Header
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}/>

      <main className="d-flex flex-column flex-grow-1" style={{ minHeight: '0' }}>
        <div className="row h-75 mb-3">
          <div className="col-md-8 col-sm-12 d-flex flex-column h-100">
            <WebcamCard onPredictionResult={onPrediction} />
          </div>

          <div className="col-md-4 d-sm-none d-md-flex flex-column h-100 overflow-hidden">
            <PredictionHistoryCard/>
          </div>
        </div>

        <div className="row h-25">
          <div className="col-8 d-flex flex-column h-100">
            <TranslatedOutputCard
              translatedText={translatedText}
              setTranslatedText={setTranslatedText}
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
}

export default App;
