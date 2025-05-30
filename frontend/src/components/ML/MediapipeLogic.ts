// hooks/useMediaPipeHands.ts
import { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS, type Results } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";


export const useMediaPipeHands = (
  getVideo: () => HTMLVideoElement | null,
  onLandmarks?: (landmarks: number[]) => void
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results: Results) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const video = getVideo();

      if (!canvas || !ctx || !video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 4,
          });
          drawLandmarks(ctx, landmarks, {
            color: "#FF0000",
            radius: 3, 
          });

          const flat = landmarks.flatMap((p) => [p.x, p.y, p.z]);
          onLandmarks?.(flat);
        }
      }
    });

    const detectLoop = async () => {
      const video = getVideo();
      if (video && video.readyState === 4) {
        await hands.send({ image: video });
      }
      requestAnimationFrame(detectLoop);
    };

    hands.initialize().then(() => detectLoop());
  }, [getVideo, onLandmarks]);

  return canvasRef;
};
