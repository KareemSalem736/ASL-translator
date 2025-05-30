// hooks/useTFModel.ts
import { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";

export const useTFModel = (modelUrl: string) => {
  const modelRef = useRef<tf.GraphModel | null>(null);

  useEffect(() => {
    const load = async () => {
      modelRef.current = await tf.loadGraphModel(modelUrl);
    };
    load();
  }, [modelUrl]);

  const predict = async (input: number[]) => {
    if (!modelRef.current) return null;
    const tensor = tf.tensor(input).reshape([1, input.length]);
    const output = modelRef.current.predict(tensor) as tf.Tensor;
    const result = await output.array();
    return result;
  };

  return { predict };
};
