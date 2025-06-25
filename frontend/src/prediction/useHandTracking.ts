// This file is for a custom hook that handles hand tracking using MediaPipe Hands and a Web Worker.
// It sets up the MediaPipe Hands model, manages the camera, and communicates with a Web Worker for predictions.
// This hook is used in the WebcamFeed component to track hand movements and make predictions based on the detected landmarks.


import { useEffect, useRef } from "react";
import { HAND_CONNECTIONS, Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import HandPredictorWorker from "../prediction/handPredictor.worker.ts?worker";
import type { PredictionResponse } from "../prediction/predictionAPI";

interface UseHandTrackingParams {
  videoComponentRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPredictionResult: (res: PredictionResponse) => void;
  isActive: boolean;
  width: number;
  height: number;
  showLandmarks: boolean;
  showPrediction: boolean;
}

/**
 * Custom hook for hand tracking using MediaPipe Hands and a Web Worker.
 * It handles the setup of MediaPipe Hands, camera, and worker communication.
 *
 * @param {UseHandTrackingParams} params - Parameters for the hand tracking hook.
 * @returns {void}
 */
export function useHandTracking({
  videoComponentRef,
  canvasRef,
  onPredictionResult,
  isActive,
  width,
  height,
  showLandmarks,
  showPrediction,
}: UseHandTrackingParams) {
  const workerRef = useRef<Worker | null>(null); // Worker reference to communicate with the hand predictor worker
  // This worker will handle the prediction logic in a separate thread
  // to avoid blocking the main thread during predictions.
  const handsRef = useRef<Hands | null>(null); // MediaPipe Hands instance for hand tracking
  const cameraRef = useRef<Camera | null>(null); // Camera instance to capture video frames from the webcam
  const lastSentRef = useRef(0); // Timestamp of the last message sent to the worker
  const interval = 1000; // Interval in milliseconds to send data to the worker
  const isCameraRunningRef = useRef(false); // Flag to track if the camera is currently running

  const showLandmarksRef = useRef(showLandmarks); 
  const showPredictionRef = useRef(showPrediction);
  const onPredictionResultRef = useRef(onPredictionResult);

  const dotsLandmarkOptions = { color: "#FF0000", radius: 2 }; // Options for drawing landmarks as red dots
  const connectorsLandmarkOptions = { color: "#66ff00", radius: 2 }; // Options for drawing connectors between landmarks as green lines

  // ─── Keep the latest props in refs ───
  // This is necessary to avoid stale closures in the worker callback
  // If showLandmarks changes, we want to ensure the worker uses the latest value
  useEffect(() => {
    showLandmarksRef.current = showLandmarks;
  }, [showLandmarks]);

  // ─── Keep the latest showPrediction in a ref ───
  // This is necessary to avoid stale closures in the worker callback
  // If showPrediction changes, we want to ensure the worker uses the latest value
  useEffect(() => {
    showPredictionRef.current = showPrediction;
  }, [showPrediction]);

  // ─── Keep the latest callback in a ref ───
  // This is necessary to ensure the worker always calls the latest version of onPredictionResult
  // If onPredictionResult changes, we want to ensure the worker uses the latest version
  useEffect(() => {
    onPredictionResultRef.current = onPredictionResult;
  }, [onPredictionResult]);

  // ─── Mount‐only setup: instantiate Hands + Worker once ───
  useEffect(() => {
    // 1) Worker
    workerRef.current = new HandPredictorWorker();
    workerRef.current.onmessage = (e: MessageEvent<{
      success: boolean;
      data: PredictionResponse;
    }>) => {
      try {
        const { success, data } = e.data;
        if (success) {
          onPredictionResultRef.current(data);
        } else {
          onPredictionResultRef.current({
            prediction: "",
            confidence: 0,
            accuracy: 0,
            probabilities: {},
            inferenceTimeMs: 0,
          });
        }
      } catch (err) {
        console.error("Worker onmessage error:", err);
      }
    };

    // 2) Instantiate MediaPipe Hands once
    handsRef.current = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`, // Use CDN for MediaPipe Hands files
    });

    // Set up the Hands model
    handsRef.current.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    // 3) onResults → draw + maybe send to worker
    handsRef.current.onResults((results) => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const ctx = canvasEl.getContext("2d");
      if (!ctx) return;

      // Draw the camera frame
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(results.image, 0, 0, width, height);

      // If we detected any hands, optionally draw landmarks + optionally post to worker
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        if (showLandmarksRef.current) {
          // Draw the red dots
          drawLandmarks(ctx, results.multiHandLandmarks[0], dotsLandmarkOptions);

          // Draw the red lines between those dots
          drawConnectors(ctx, results.multiHandLandmarks[0], HAND_CONNECTIONS, connectorsLandmarkOptions);
        }

        // If showPrediction is true, send the flattened landmarks to the worker
        // This is done at a specified interval to avoid flooding the worker with messages
        if (showPredictionRef.current && workerRef.current) {
          const now = Date.now();
          if (now - lastSentRef.current > interval) {
            lastSentRef.current = now;
            const flattened = results.multiHandLandmarks[0].flatMap((lm) => [
              lm.x,
              lm.y,
              lm.z,
            ]);
            workerRef.current.postMessage(flattened);
          }
        }
      }

      ctx.restore();
    });

    // Cleanup only on unmount

    return () => {
      cameraRef.current?.stop();
      handsRef.current?.close();
      workerRef.current?.terminate();

      workerRef.current = null;
      handsRef.current = null;
      cameraRef.current = null;
    };
  }, []); 

  // ─── Effect to start/stop camera based on isActive ───
  // This effect runs whenever isActive changes
  // It starts the camera when isActive is true, and stops it when false
  const lastFrameTimeRef = useRef(0);
  const frameInterval = 1000 / 60;   // target FPS
  
  useEffect(() => {
    const videoEl = videoComponentRef.current;

    if (!videoEl) return;

    if (isActive) {
      if (handsRef.current && !isCameraRunningRef.current) {
        cameraRef.current = new Camera(videoEl, {
          onFrame: async () => {
            const now = Date.now();
            if (now - lastFrameTimeRef.current < frameInterval) return;
            lastFrameTimeRef.current = now;

            const hasFrame =
              videoEl.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA &&
              videoEl.videoWidth > 0 &&
              videoEl.videoHeight > 0;
            if (!handsRef.current || !hasFrame) return;

            try {
              await handsRef.current.send({ image: videoEl });
            } catch (err) {
              console.warn("MediaPipe Hands send() error:", err);
            }
          },
          width,
          height,
        });

        cameraRef.current.start();
        isCameraRunningRef.current = true;
      }
    } else {
  // 🔻 1. Stop MediaPipe Camera
  if (cameraRef.current && isCameraRunningRef.current) {
    console.log("[MediaPipe] Stopping camera loop");
    cameraRef.current.stop();
    cameraRef.current = null;
    isCameraRunningRef.current = false;
  }

  // 🔻 2. Stop media tracks and detach from video
  const videoEl = videoComponentRef.current;
  if (videoEl?.srcObject instanceof MediaStream) {
    console.log("[Webcam] Stopping video tracks...");
    videoEl.srcObject.getTracks().forEach((track, i) => {
      console.log(
        `  - Track #${i} (${track.kind}): readyState=${track.readyState}`
      );
      try {
        track.stop();
        console.log(`    ✅ Track #${i} stopped.`);
      } catch (err) {
        console.warn(`    ❌ Error stopping track #${i}:`, err);
      }
    });

    // Remove video stream reference
    videoEl.srcObject = null;
    console.log("[Webcam] srcObject set to null.");
  } else {
    console.log("[Webcam] No MediaStream found on video element.");
  }

  // 🔻 3. Clear canvas visually
  const ctx = canvasRef.current?.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    console.log("[Canvas] Cleared.");
  }
}



    // No cleanup function needed here — cleanup is handled in the unmount effect
  }, [isActive, width, height, videoComponentRef, canvasRef]);

}
