import { render, screen, fireEvent } from "@testing-library/react";
import PredictionHistoryCard from "../prediction/PredictionHistoryCard"; 
import { describe, it, expect } from "vitest";

describe("PredictionHistoryCard", () => {
  it("renders the card label", () => {
    render(<PredictionHistoryCard />);
    expect(screen.getByText(/prediction history/i)).toBeInTheDocument();
  });

  it("renders the download button with tooltip", () => {
    render(<PredictionHistoryCard />);
    const button = screen.getByLabelText(/download history/i);
    expect(button).toBeInTheDocument();
  });

  it("displays fallback message when no predictions exist", () => {
    render(<PredictionHistoryCard />);
    expect(screen.getByText(/no predictions yet/i)).toBeInTheDocument();
  });

//   it("throws error when download button is clicked (not implemented)", () => {
//     render(<PredictionHistoryCard />);
//     const button = screen.getByLabelText(/download history/i);
//     expect(() => fireEvent.click(button)).toThrow("Function not implemented.");
//   });
});
