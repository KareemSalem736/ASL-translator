// // src/hooks/useMediaPipe.tsx

//
// MAY NOT BE NEEDED
//

// import { useEffect, useRef } from "react";
// import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
// import { Camera } from "@mediapipe/camera_utils";
// import { drawLandmarks } from "@mediapipe/drawing_utils";
// import HandPredictorWorker from "../workers/handPredictor.worker.ts?worker";
// import type { PredictionResponse } from "../api/predictionAPI";

// interface UseMediaPipeParams {
//   videoRef: React.RefObject<HTMLVideoElement | null>;
//   canvasRef: React.RefObject<HTMLCanvasElement | null>;
//   onPredictionResult: (res: PredictionResponse) => void;
//   /** Always pass 320 */
//   width: number;
//   /** Always pass 240 */
//   height: number;
//   active: boolean;
// }

// export default function useMediaPipe({
//   videoRef,
//   canvasRef,
//   onPredictionResult,
//   width,
//   height,
//   active,
// }: UseMediaPipeParams) {
//   // Worker reference
//   const workerRef = useRef<Worker | null>(null);
//   // Prevent overlapping worker calls
//   const lastSentRef = useRef(0);
//   const interval = 1000; // 1 request per second

//   useEffect(() => {
//     if (!active) return;
//     if (!videoRef.current || !canvasRef.current) return;

//     // 1) Start (or re‐start) our worker if needed
//     if (!workerRef.current) {
//       workerRef.current = new HandPredictorWorker();
//       workerRef.current.onmessage = (
//         e: MessageEvent<{ success: boolean; data: PredictionResponse }>
//       ) => {
//         const { success, data } = e.data;
//         if (success) {
//           onPredictionResult(data);
//         } else {
//           // send zero‐stats if error
//           onPredictionResult({
//             prediction: "",
//             confidence: 0,
//             accuracy: 0,
//             probabilities: {},
//             inferenceTimeMs: 0,
//           });
//         }
//       };
//     }

//     const videoElement = videoRef.current;
//     const canvasElement = canvasRef.current;
//     const canvasCtx = canvasElement.getContext("2d");
//     if (!canvasCtx) return;

//     // 2) Initialize Mediapipe at 320×240, modelComplexity 0
//     const hands = new Hands({
//       locateFile: (file) =>
//         `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
//     });
//     hands.setOptions({
//       maxNumHands: 1,
//       modelComplexity: 0, // lighter, faster
//       minDetectionConfidence: 0.6,
//       minTrackingConfidence: 0.6,
//     });

//     hands.onResults((results) => {
//       // a) Draw the raw video frame (320×240) onto the canvas
//       canvasCtx.save();
//       canvasCtx.clearRect(0, 0, width, height);
//       canvasCtx.drawImage(results.image, 0, 0, width, height);

//       // b) If landmarks exist, draw just points (faster than connectors)
//       if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
//         drawLandmarks(canvasCtx, results.multiHandLandmarks[0], {
//           color: "#FF0000",
//           radius: 2,
//         });

//         // c) Throttle network calls to once per second
//         const now = Date.now();
//         if (now - lastSentRef.current > interval && workerRef.current) {
//           lastSentRef.current = now;
//           const flattened = results.multiHandLandmarks[0].flatMap((lm) => [
//             lm.x,
//             lm.y,
//             lm.z,
//           ]);
//           // Post landmarks to worker off‐thread
//           workerRef.current.postMessage(flattened);
//         }
//       }
//       // If no hand, simply do nothing (no API, no React update)
//       canvasCtx.restore();
//     });

//     // 3) Hook up camera at 320×240 (not 640×480!)
//     const camera = new Camera(videoElement, {
//       onFrame: async () => {
//         await hands.send({ image: videoElement });
//       },
//       width, // pass in 320
//       height, // pass in 240
//     });
//     camera.start();

//     return () => {
//       camera.stop();
//       hands.close();
//       workerRef.current?.terminate();
//       workerRef.current = null;
//     };
//   }, [active, videoRef, canvasRef, onPredictionResult, width, height]);
// }
