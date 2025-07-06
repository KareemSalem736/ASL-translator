import axiosInstance from "../axiosConfig";

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

export interface ErrorResponse {
  error_code: number;
  error: string;
}

// Default response object to return in case of errors
export const DEFAULT_PREDICTIONRESPONSE = {
  prediction: "",
  confidence: 0,
  accuracy: 0,
  probabilities: {},
  inferenceTimeMs: 0,
}

export interface PredictionHistoryResult {
  user_id: string;
  content: string;
  id: number;
  created_at: string;
}

/**
 * Add to authenticated user's prediction history.
 * @param data
 */
export const addPredictionHistory = async (data: string): Promise<string | void> => {
  try {
      const response = await axiosInstance.post<{ message: string }>(
          '/account/add-prediction', {prediction_string: data});

      if (response.status !== 200) {
        return;
      }
      return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Prediction history update failed.");
  }
}

export const getPredictionHistory = async (): Promise<PredictionHistoryResult[] | undefined> => {
    try {
      const response = await axiosInstance.get<PredictionHistoryResult[]>(
          '/account/get-predictions');

      if (response.status !== 200) {
        return;
      }

      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to get prediction history");
    }
}

/**
 * Send flattened landmarks to /predict and return the prediction stats.
 * @param landmarks Array of 63 numbers: [x0,y0,z0, x1,y1,z1, …, x20,y20,z20]
 * @param token access token to be passed to PredictionResponse request.
 */
export async function getHandPrediction(
  landmarks: number[], token: string | undefined
): Promise<PredictionResponse> {
  try {
    const response = await axiosInstance.post<PredictionResponse>(
      "/predict",
      { landmarks }, !token ? {} : {headers: {Authorization: `Bearer ${token}`}}
    );
    return response.data;
  } catch (err) {
    console.error("Error in getHandPrediction:", err);
    // You can choose to rethrow or return a default “empty” object
    return DEFAULT_PREDICTIONRESPONSE;
  }
}
