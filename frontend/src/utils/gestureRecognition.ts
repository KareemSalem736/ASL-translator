import * as fp from "fingerpose";

const GE = new fp.GestureEstimator([
  fp.Gestures.ThumbsUpGesture,
  fp.Gestures.VictoryGesture,
]);

export const detectGesture = (landmarks3D: any[]) => {
  const result = GE.estimate(landmarks3D, 7.5);
  if (result.gestures.length > 0) {
    const best = result.gestures.reduce((p, c) => (p.score > c.score ? p : c));
    return best.name;
  }
  return null;
};
