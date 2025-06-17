// This file is a Web Worker that handles hand prediction using an API.
import {getHandSequencePrediction, type PredictionResponse} from "../api/predictionAPI";

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

self.onmessage = async (e: MessageEvent<ArrayBuffer>) => {
  try {
    const flat = new Float32Array(e.data);

    const frameSize = 63;
    const landmarksBatch: number[][] = [];
    for (let i = 0; i < flat.length; i += frameSize) {
      landmarksBatch.push(Array.from(flat.slice(i, i + frameSize)));
    }

    const data: any = await getHandSequencePrediction(landmarksBatch);
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
    console.error("Worker: getHandSequencePrediction failed", err);
    self.postMessage({
      success: false,
      data: { prediction: "", confidence: 0, accuracy: 0, probabilities: {}, inferenceTimeMs: 0 },
    });
  }
};
