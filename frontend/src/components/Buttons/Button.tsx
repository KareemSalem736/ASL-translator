// This component is a reusable button that can be used for various purposes, including internal navigation with React Router or external links. It supports different styles and click handlers.

import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";

export interface ButtonProps {
  children: ReactNode; // Button content, can be text or JSX elements
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit";
  onClick?: () => void;
  to?: string; // for internal navigation (React Router)
  href?: string; // for external links
  target?: string; // optional, for external links
  rel?: string; // optional, e.g., "noopener noreferrer"
}

const Button = ({
  children,
  className = "btn-light",
  type = "button",
  onClick,
  style = {},
  to,
  href,
  target,
  rel,
}: ButtonProps) => {
  const baseClass = `btn ${className} fw-bold rounded-pill`;

  if (to) {
    // React Router Link
    return (
      <Link to={to} className={baseClass} style={style}>
        {children}
      </Link>
    );
  }

  if (href) {
    // External Link
    return (
      <a
        href={href}
        className={baseClass}
        style={style}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    );
  }

  // Standard Button
  return (
    <button style={style} type={type} className={baseClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
