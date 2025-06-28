import Card from "../components/Card";
import CardIconButton from "../components/CardIconButton";

const PredictionHistoryCard = () => {



  return (
    <Card
      header={
        <div className="d-flex justify-content-between">
          <p className="m-0">Prediction History</p>
          <span className="d-flex gap-2">
            <CardIconButton
              icon={"bi-three-dots-vertical"}
              tooltip={"Download History"}
              onClick={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          </span>
        </div>
      }
      nullContentMessage="No predictions yet."
      className="h-100 overflow-auto d-flex flex-column"
    >
      {/* Prediction History here... */}
    </Card>
  );
};

export default PredictionHistoryCard;
