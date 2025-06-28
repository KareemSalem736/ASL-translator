// CardIconButton component renders a button with an icon and a tooltip.
// It uses Bootstrap's Button and Tooltip components for styling and functionality.
// It accepts an icon class name, tooltip text, click handler, and optional additional classes.

import { type ReactNode } from "react";
import TooltipWrapper from "../components/TooltipWrapper";

interface CardIconButtonProps {
  icon: ReactNode; // Icon class name, e.g. "bi-plus-circle"
  tooltip: string; // Tooltip text
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const CardIconButton = ({
  className = "",
  icon,
  tooltip,
  onClick,
  disabled = false
}: CardIconButtonProps) => {
  return (
    <TooltipWrapper message={tooltip} placement="top" trigger="hover">
      <button
        className={`bi ${icon} bg-white py-0 border-0 ${className}`}
        onClick={onClick}
        disabled={disabled}
      ></button>
    </TooltipWrapper>
  );
};

export default CardIconButton;
