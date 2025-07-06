// This component is a reusable button that can be used for various purposes, including internal navigation with React Router or external links. It supports different styles and click handlers.
// It accepts children as content, a className for styling, and optional props for type, onClick handler, and link attributes.
// It can render as a standard button, a React Router Link, or an anchor tag for external links.

import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import TooltipWrapper from "../components/TooltipWrapper";

export interface ButtonProps {
  children: ReactNode; // Button content, can be text or JSX elements
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit";
  tooltip?: string;
  tooltipPlacements?: "top" | "bottom" | "left" | "right" | undefined;
  onClick?: () => void;
  to?: string; // for internal navigation (React Router)
  href?: string; // for external links
  target?: string; // optional, for external links
  rel?: string; // optional, e.g., "noopener noreferrer"
  [key: string]: any; // allows arbitrary props like aria-label
}

const Button = ({
  children,
  className = "btn-light",
  type = "button",
  tooltip,
  tooltipPlacements,
  onClick,
  style = {},
  to,
  href,
  target,
  rel,
  ...rest // capture any extra props
}: ButtonProps) => {
  const closeClass = className?.includes('btn-close');
  const baseClass = `btn ${className} ${closeClass ? '' : 'fw-bold rounded-pill'}`;

  // React Router Link
  if (to) {
    return (
      <Link
        to={to}
        className={`text-decoration-none text-primary`}
        style={style}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  // External Link
  if (href) {
    return (
      <a
        href={href}
        className={baseClass}
        style={style}
        target={target}
        rel={rel}
        {...rest}
      >
        {children}
      </a>
    );
  }

  // Standard Button
  return (
    <TooltipWrapper
      message={tooltip || ""}
      placement={tooltipPlacements}
      trigger="hover"
    >
      <button
        style={style}
        type={type}
        className={baseClass}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    </TooltipWrapper>
  );
};

export default Button;
