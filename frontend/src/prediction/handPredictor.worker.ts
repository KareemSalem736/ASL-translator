// This file is a Web Worker that handles hand prediction using an API.
import { getHandPrediction, type PredictionResponse } from "../prediction/predictionAPI";

// Runtime type guard to validate PredictionResponse shape
function isPredictionResponse(x: any): x is PredictionResponse {
  return (
    x != null &&
    typeof x.prediction === "string" &&
    typeof x.confidence === "number" &&
    typeof x.accuracy === "number" &&
    typeof x.inferenceTimeMs === "number" &&
    typeof x.probabilities === "object"
  );
}

self.onmessage = async (e: MessageEvent<number[]>) => {
  const landmarks = e.data;
  try {
    const data: any = await getHandPrediction(landmarks);
    if (isPredictionResponse(data)) {
      self.postMessage({ success: true, data });
    } else {
      console.error("Worker: Invalid response shape from API", data);
      self.postMessage({
        success: false,
        data: {
          prediction: "",
          confidence: 0,
          accuracy: 0,
          probabilities: {},
          inferenceTimeMs: 0,
        },
      });
    }
  } catch (err) {
    console.error("Worker: getHandPrediction failed", err);
    self.postMessage({
      success: false,
      data: { prediction: "", confidence: 0, accuracy: 0, probabilities: {}, inferenceTimeMs: 0 },
    });
  }
};
