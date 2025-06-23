// CardIconButton component renders a button with an icon and a tooltip.
// It uses Bootstrap's Button and Tooltip components for styling and functionality.
// It accepts an icon class name, tooltip text, click handler, and optional additional classes.

import { type ReactNode } from "react";
import Button from "./Button";

interface CardIconButtonProps {
  icon: ReactNode; // Icon class name, e.g. "bi-plus-circle"
  tooltip: string; // Tooltip text
  onClick: () => void;
}

const CardIconButton = ({ icon, tooltip, onClick }: CardIconButtonProps) => {
  return (
    <Button className="px-1 py-0 border-0" onClick={onClick} tooltip={tooltip}>
      <i className={`bi ${icon}`}></i>
    </Button>
  );
};

export default CardIconButton;
