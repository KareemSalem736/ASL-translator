// This component renders a card with an optional header and children.
// If children are provided, they are displayed inside the card; otherwise, a default message is shown.

import { type ReactNode } from "react";

interface CardProps {
  header?: ReactNode;
  children?: ReactNode;
  cameraViewPort?: ReactNode;
  className?: string;
  nullContentMessage?: string; // Optional prop for custom message when content is null
}

const Card = ({
  header,
  children,
  cameraViewPort = null,
  className = "",
  nullContentMessage = "Content unavailable",
}: CardProps) => (
  <div className={`d-flex flex-column h-100 shadow rounded-4 ${className}`}>
    {header != null && (
      <div className="bg-white position-sticky top-0 border-bottom rounded-top-4 pt-1 px-2 mb-1">
        <span className="fw-bold text-primary">{header}</span>
      </div>
    )}
    {cameraViewPort}
    {children && (
      <div className="w-100 d-flex flex-column gap-3 px-2 overflow-auto flex-grow-1 px-3 rounded-bottom-4">
        {children}
      </div>
    )}
    {!children && !cameraViewPort && (
      <div className="w-100 d-flex flex-column gap-3 px-2 h-100">
        <p className="text-muted m-auto">{nullContentMessage}</p>
      </div>
    )}
  </div>
);

export default Card;
