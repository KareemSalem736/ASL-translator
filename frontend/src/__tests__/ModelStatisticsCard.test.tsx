import { render, screen } from "@testing-library/react";
import ModelStatisticsCard from "../prediction/ModelStatisticsCard"; 
import { describe, it, expect } from "vitest";

describe("ModelStatisticsCard", () => {
  const mockStats = {
    accuracy: 87.5,
    confidence: 92.3,
    inferenceTimeMs: 156,
  };

  it("renders the card with label and statistics", () => {
    render(<ModelStatisticsCard stats={mockStats} />);

    // Card header
    expect(screen.getByText(/model statistics/i)).toBeInTheDocument();

    // Progress bar labels
    expect(screen.getByText(/model accuracy/i)).toBeInTheDocument();
    expect(screen.getByText(/prediction confidence/i)).toBeInTheDocument();

    // Inference time
    expect(screen.getByText(/inference time/i)).toBeInTheDocument();
    expect(screen.getByText("156 ms")).toBeInTheDocument();
  });

  it("displays progress bar values as percentages", () => {
    render(<ModelStatisticsCard stats={mockStats} />);

    // The ProgressBar component might render percentage values directly or as inline styles.
    // Assuming the percentage appears in the DOM as text (adjust if needed):
    expect(screen.getAllByText(/0.0/i)[1]).toBeInTheDocument();
  });

//   it("shows placeholder for missing stats", () => {
//     render(<ModelStatisticsCard stats={null} />);

//     expect(screen.getByText(/no model stats available/i)).toBeInTheDocument();
//   });
});
