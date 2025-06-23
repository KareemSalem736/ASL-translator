// Usage example:
// <ProgressBar label="Progress" value={0.75} colorClass="bg-success" minWidthPercent={10} />
// This component can be used to display progress bars with customizable labels, values, and colors.
// The `minWidthPercent` prop ensures that the label is always visible if the percentage is above that threshold.
// The `colorClass` prop allows for easy customization of the progress bar's color using Bootstrap classes.

import type { ReactNode } from "react";

interface ProgressBarProps {
  icon: ReactNode;
  label: string;
  value: number; // 0–1
  /**
   * Optional thresholds: array of { percentage, colorClass } sorted ascending
   * e.g. [{ percentage: 0.5, colorClass: 'bg-danger' }, ...]
   */
  thresholds?: { percentage: number; colorClass: string }[];
  minWidthPercent?: number; // ensure label fits
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  icon,
  label,
  value,
  thresholds,
  minWidthPercent = 0.01, // default to 1% minimum width for label
}) => {
  // Convert to percentage (0–100)
  const pct = Math.min(Math.max(value * 100, 0), 100);

  // Determine color based on thresholds or default scheme
  const getColorClass = () => {
    if (thresholds && thresholds.length) {
      // find the highest threshold <= pct
      const match = thresholds
        .slice()
        .sort((a, b) => a.percentage - b.percentage)
        .reduce<string | null>((acc, t) => {
          return pct >= t.percentage * 100 ? t.colorClass : acc;
        }, thresholds[0].colorClass);
      return match || "bg-primary";
    }
    // default: red for <50%, yellow for <75%, green otherwise
    if (pct < 50) return "bg-danger";
    if (pct < 75) return "bg-warning";
    return "bg-success";
  };

  // const colorClass = getColorClass();

  return (
    <div className="d-flex flex-column">
      {/* Label with icon */}
      <label className="form-label m-0">
        {icon}
        {label}
      </label>
      <div className="d-flex align-items-center gap-2">
        <div
          className="progress flex-grow-1"
          style={{ height: "0.5rem", minWidth: `${minWidthPercent}rem` }}
        >
          <div
            className={`progress-bar ${getColorClass()}`}
            role="progressbar"
            style={{ width: `${pct}%` }}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="m-0 small">{pct.toFixed(1)}%</div>
      </div>
    </div>
  );
};

export default ProgressBar;
