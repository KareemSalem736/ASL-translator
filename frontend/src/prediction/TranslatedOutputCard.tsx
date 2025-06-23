import Card from "../components/Card";
import CardIconButton from "../components/CardIconButton";

interface TranslatedOutputCardProps {
  translatedText: string;
  setTranslatedText: (text: string) => void;
}

const TranslatedOutputCard = ({
  translatedText,
  setTranslatedText,
}: TranslatedOutputCardProps) => {
  return (
    <Card
      header={
        <div className="d-flex justify-content-between">
          <p className="m-0"> Translated Output</p>

          <span className="d-flex gap-2">
            <CardIconButton
              icon={"bi-arrow-90deg-left"}
              tooltip={"Undo"}
              onClick={function (): void {
                throw new Error("Function not implemented.");
              }}
            />

            <CardIconButton
              icon={"bi-arrow-repeat"}
              tooltip={"Clear"}
              onClick={function (): void {
                setTranslatedText("");
              }}
            />

            <CardIconButton
              icon={"bi-copy"}
              tooltip={"copy"}
              onClick={() => navigator.clipboard.writeText(translatedText)}
            />
          </span>
        </div>
      }
      nullContentMessage="No predictions yet."
    >
      {/* <div className="d-flex align-items-center">
      <div className="pt-2 pb-3 text-break">{translatedText}</div>
    </div> */}
      {translatedText && (
        <div className="pt-2 pb-3 text-break">{translatedText}</div>
      )}
    </Card>
  );
};

export default TranslatedOutputCard;
