import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import type { PredictionResponse } from "../prediction/predictionAPI";

interface ModelStatisticsCardProps {
  stats: PredictionResponse | null;
}

const ModelStatisticsCard = ({ stats }: ModelStatisticsCardProps) => {
  return (
    <Card
      header={
        <div className="d-flex justify-content-between">
          <p className="m-0">Model Statistics</p>
        </div>
      }
      nullContentMessage="No model stats available."
    >
      <ProgressBar
        icon={<i className="bi bi-cpu me-1" />}
        label="Model Accuracy"
        value={stats?.accuracy ?? 0.0}
      />

      <ProgressBar
        icon={<i className="bi bi-bullseye me-1" />}
        label="Prediction Confidence"
        value={stats?.confidence ?? 0.0}
      />

      <p className="my-2">
        <i className="bi bi-stopwatch me-1" />
        <span>Inference Time:</span>{" "}
        <span className="badge bg-secondary">
          {stats?.inferenceTimeMs != null ? `${stats.inferenceTimeMs} ms` : "-"}
        </span>
      </p>
    </Card>
  );
};

export default ModelStatisticsCard;
