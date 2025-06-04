import axiosInstance from "./axiosConfig";

export interface PredictionResponse {
  prediction: string;
  confidence: number;
  accuracy?: number;
  probabilities?: Record<string, number>;
  inferenceTimeMs?: number;
  // …any other fields your backend returns
}

export const DEFAULT_PREDICTIONRESPONSE = {
  prediction: "",
  confidence: 0,
  accuracy: 0,
  probabilities: {},
  inferenceTimeMs: 0,
}

/**
 * Send flattened landmarks to /predict and return the prediction stats.
 * @param landmarks Array of 63 numbers: [x0,y0,z0, x1,y1,z1, …, x20,y20,z20]
 */
export async function getHandPrediction(
  landmarks: number[]
): Promise<PredictionResponse> {
  try {
    const response = await axiosInstance.post<PredictionResponse>(
      "/predict",
      { landmarks }
    );
    return response.data;
  } catch (err) {
    console.error("Error in getHandPrediction:", err);
    // You can choose to rethrow or return a default “empty” object
    return DEFAULT_PREDICTIONRESPONSE;
  }
}
