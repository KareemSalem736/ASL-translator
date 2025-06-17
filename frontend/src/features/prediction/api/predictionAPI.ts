import axiosInstance from "../../../api/axiosConfig";

export interface PredictionResponse {
  prediction: string;   // The predicted text or label  
  confidence: number;     // Confidence score (0 to 1)
  // Optional fields that backend might return
  // These are not always present, so they are optional
  // You can adjust these based on your backend response structure
  // e.g. accuracy, probabilities, inference time
  accuracy?: number;          // Accuracy score (0 to 1) how well the model performed as a whole
  probabilities?: Record<string, number>;   // Probabilities for each letter < letter: probability >                        
  inferenceTimeMs?: number;                             // Inference time in milliseconds shows how long the model took to make a prediction
  // …any other fields your backend returns
}

// Default response object to return in case of errors
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
