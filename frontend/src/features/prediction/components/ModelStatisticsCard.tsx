import Card from "../../components/Card/Card";
import CardIconButton from "../../components/Button/CardIconButton";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import type { PredictionResponse } from "../api/predictionAPI";

interface ModelStatisticsCardProps {
  stats: PredictionResponse | null;
}

const ModelStatisticsCard = ({ stats }: ModelStatisticsCardProps) => {
  return (
    <Card
      header={
        <div className="d-flex justify-content-between">
          <p className="m-0">Model Statistics</p>

          <span className="d-flex gap-2">
            <CardIconButton
              icon="bi-tools"
              tooltip="Settings"
              onClick={() => {
                console.warn("Settings button clicked.");
              }}
            />
            <CardIconButton
              icon="bi-arrow-clockwise"
              tooltip="Refresh"
              onClick={() => {
                console.warn("Refresh button clicked.");
              }}
            />
          </span>
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

      {/* <div className="">
        <span>Probabilities:</span>
        {stats?.probabilities && Object.keys(stats.probabilities).length > 0 ? (
          <ul className="list-group list-group-flush">
            {Object.entries(stats.probabilities).map(([label, prob]) => (
              <li
                key={label}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {label}
                <span className="badge bg-primary rounded-pill">
                  {(prob * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mt-2 mb-0">No probabilities available.</p>
        )}
      </div> */}
    </Card>
  );
};

export default ModelStatisticsCard;
