import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import { ASL_RULES } from "./ASLRule"; // your external rule file

const HandGesture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] = useState<string>("No hand detected");

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!canvas || !ctx || !webcamRef.current?.video) return;

      canvas.width = webcamRef.current.video.videoWidth;
      canvas.height = webcamRef.current.video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(webcamRef.current.video, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { lineWidth: 2 });
        drawLandmarks(ctx, landmarks, { radius: 3 });

        let matched = false;
        for (const rule of ASL_RULES) {
          if (rule.conditions(landmarks)) {
            setGesture(`ASL Letter: ${rule.letter}`);
            matched = true;
            break;
          }
        }

        if (!matched) {
          setGesture("No ASL letter matched");
        }
      } else {
        setGesture("No hand detected");
      }
    });

    if (webcamRef.current?.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current!.video! });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div>
      <Webcam ref={webcamRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ width: "640px", height: "480px" }} />
      <h2>{gesture}</h2>
    </div>
  );
};

export default HandGesture;
