declare module "@mediapipe/drawing_utils" {
    export function drawConnectors(
      ctx: CanvasRenderingContext2D,
      landmarks: { x: number; y: number }[],
      connections: Array<[number, number]>,
      style?: { color?: string; lineWidth?: number }
    ): void;
  
    export function drawLandmarks(
      ctx: CanvasRenderingContext2D,
      landmarks: { x: number; y: number }[],
      style?: { color?: string; radius?: number }
    ): void;
  }
  