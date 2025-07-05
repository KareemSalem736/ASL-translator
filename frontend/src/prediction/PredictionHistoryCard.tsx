import Card from "../components/Card";
import CardIconButton from "../components/CardIconButton";
import { usePredictionHistory } from "./PredictionHistoryContext.tsx";
import { useAuth } from "../auth/AuthProvider.tsx";

const PredictionHistoryCard = () => {
  const { history, isLoading, fetchHistory } = usePredictionHistory();
  const { isAuthenticated } = useAuth();

  // Create a more readable date format.
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const datePart = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { datePart, timePart };
  };
  return (
    <Card
      header={
        <div className="d-flex justify-content-between">
          <p className="m-0">Prediction History</p>
          <span className="d-flex gap-2">
            <CardIconButton
              icon={"bi bi-arrow-clockwise"}
              tooltip={"Reload"}
              onClick={fetchHistory}
              disabled={isLoading}
            />
            {/* <CardIconButton
              icon={"bi-three-dots-vertical"}
              tooltip={"Download History"}
              onClick={function (): void {
                throw new Error("Function not implemented.");
              }}
            /> */}
          </span>
        </div>
      }
      nullContentMessage={
        isAuthenticated
          ? "No predictions yet."
          : "Please sign in to see history results."
      }
      hasContent={history.length > 0}
      className="h-100 d-flex flex-column"
    >
      <div className="list-group list-group-flush flex-grow-1 overflow-auto">
        {history.map((result) => (
          <ul
            key={result.id}
            className="list-group-item d-flex justify-content-between align-items-center gap-3"
          >
            {/* Left side: Formatted Date */}
            <span
              className="text-muted small flex-shrink-0"
              style={{ width: "70px" }}
            >
              <div>{formatDate(result.created_at).datePart}</div>
              <div>{formatDate(result.created_at).timePart}</div>
            </span>

            {/* Right side: Content */}
            <span className="flex-grow-1 text-truncate" style={{ minWidth: 0 }}>
              {result.content}
            </span>
          </ul>
        ))}
      </div>
    </Card>
  );
};

export default PredictionHistoryCard;
