import * as fp from "fingerpose";

const GE = new fp.GestureEstimator([
  fp.Gestures.ThumbsUpGesture,
  fp.Gestures.VictoryGesture,
]);

export const detectGesture = (landmarks3D: any[]) => {
    if (!landmarks3D || landmarks3D.length !== 21) {
      console.warn("Expected 21 landmarks for gesture recognition");
      return null;
    }
  
    const GE = new fp.GestureEstimator([
      fp.Gestures.ThumbsUpGesture,
      fp.Gestures.VictoryGesture,
    ]);
  
    const result = GE.estimate(landmarks3D, 5.0); // lower confidence threshold
  
    console.log("Fingerpose result:", result);
  
    if (result.gestures.length > 0) {
      const best = result.gestures.reduce((p, c) => (p.score > c.score ? p : c));
      console.log("Detected:", best.name, "with score", best.score);
      return best.name;
    }
  
    return null;
  };
  