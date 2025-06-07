// src/hooks/useHandTracking.ts
import { useEffect, useRef } from "react";
import type Webcam from "react-webcam";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import HandPredictorWorker from "../workers/handPredictor.worker.ts?worker";
import type { PredictionResponse } from "../api/predictionAPI";

interface UseHandTrackingParams {
  videoComponentRef: React.RefObject<Webcam | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPredictionResult: (res: PredictionResponse) => void;
  isActive: boolean;
  width: number;
  height: number;
  showLandmarks: boolean;
  showPrediction: boolean;
}

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
  const workerRef = useRef<Worker | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const lastSentRef = useRef(0);
  const interval = 1000;
  const isCameraRunningRef = useRef(false);

  const showLandmarksRef = useRef(showLandmarks);
  const showPredictionRef = useRef(showPrediction);
  const onPredictionResultRef = useRef(onPredictionResult);

  const landmarkOptions = { color: "#FF0000", radius: 2 };

  // ─── Keep the latest props in refs ───
  useEffect(() => {
    showLandmarksRef.current = showLandmarks;
  }, [showLandmarks]);

  useEffect(() => {
    showPredictionRef.current = showPrediction;
  }, [showPrediction]);

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
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
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
          drawConnectors(ctx, results.multiHandLandmarks[0], HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 3 })
          drawLandmarks(ctx, results.multiHandLandmarks[0], landmarkOptions);
        }

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

  useEffect(() => {
    const videoEl = videoComponentRef.current?.video || null;

    if (isActive) {
      if (videoEl && handsRef.current && !isCameraRunningRef.current) {
        cameraRef.current = new Camera(videoEl, {
          onFrame: async () => {
            const hasFrame =
              videoEl.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA &&
              videoEl.videoWidth > 0 &&
              videoEl.videoHeight > 0;
            if (!handsRef.current || !hasFrame) return;

            try {
              await handsRef.current.send({ image: videoEl });
            } catch {
              console.log("service not ready");
              throw new Error("not ready");
            }
          },
          width,
          height,
        });
        cameraRef.current.start();
        isCameraRunningRef.current = true;
      }
    } else {
      if (cameraRef.current && isCameraRunningRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
        isCameraRunningRef.current = false;
      }
      // Clear the canvas immediately when camera stops
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, width, height);
    }
  }, [isActive, width, height, videoComponentRef, canvasRef]);
}
