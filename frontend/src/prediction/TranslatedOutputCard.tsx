import Card from "../components/Card";
import CardIconButton from "../components/CardIconButton";
import {getAccessToken} from "../auth/authApi.ts";
import {useState} from "react";
import {usePredictionHistory} from "./PredictionHistoryContext.tsx";

interface TranslatedOutputCardProps {
  translatedText: string;
  setTranslatedText: (text: string) => void;
}

const TranslatedOutputCard = ({
  translatedText,
  setTranslatedText
}: TranslatedOutputCardProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { addHistoryItem } = usePredictionHistory();

  const handleClear = async() => {
      if (getAccessToken()) {
          if (isSaving || translatedText.length === 0) {
              return;
          }

          setIsSaving(true);

          try {
              await addHistoryItem(translatedText);

              setTranslatedText("");
          } catch (error) {
              console.error("Failed to save prediction history:", error);
              alert("Error: could not have history.")
          } finally {
              setIsSaving(false);
          }
      } else {
          setTranslatedText("");
      }
  }

  const handleUndo = () => {
      if (translatedText.endsWith("space")) {
        setTranslatedText(translatedText.substring(0, translatedText.length - "space".length));
      } else if(translatedText.endsWith("del")) {
        setTranslatedText(translatedText.substring(0, translatedText.length - "del".length));
      } else if(translatedText.length > 0) {
        setTranslatedText(translatedText.substring(0, translatedText.length - 1));
      } else {
        throw new Error("No text to be deleted.")
      }
  }

  return (
    <Card
      header={
        <div className="d-flex justify-content-between">
          <p className="m-0"> Translated Output</p>

          <span className="d-flex gap-2">
            <CardIconButton
              icon={"bi-arrow-90deg-left"}
              tooltip={"Undo"}
              onClick={handleUndo}
              disabled={translatedText.length === 0}
            />

            <CardIconButton
              icon={"bi-arrow-repeat"}
              tooltip={"Clear"}
              onClick={handleClear}
              disabled={isSaving || translatedText.length === 0}
            />

            <CardIconButton
              icon={"bi-copy"}
              tooltip={"Copy"}
              onClick={() => navigator.clipboard.writeText(translatedText)}
              disabled={translatedText.length === 0}
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
