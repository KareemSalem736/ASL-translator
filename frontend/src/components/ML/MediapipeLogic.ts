import { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS, type Results } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { detectGesture } from "../../utils/gestureRecognition";

export const useMediaPipeHands = (
  getVideo: () => HTMLVideoElement | null,
  onLandmarks?: (landmarks: number[]) => void,
  getCanvas?: () => HTMLCanvasElement | null
) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results: Results) => {
      const video = getVideo();
      const canvas = getCanvas?.() ?? internalCanvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!canvas || !ctx || !video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      results.multiHandLandmarks?.forEach((landmarks) => {
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

        const gestureName = detectGesture(landmarks);
        if (gestureName) console.log("Detected gesture:", gestureName);
      });
    });

    handsRef.current = hands;

    const detectLoop = async () => {
      const video = getVideo();
      if (video && video.readyState === 4 && handsRef.current) {
        await handsRef.current.send({ image: video });
      }
      animationRef.current = requestAnimationFrame(detectLoop);
    };

    detectLoop(); // start loop without calling initialize

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [getVideo, onLandmarks, getCanvas]);

  return internalCanvasRef;
};
