import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WebcamCard from "../webcam/WebcamCard"; // Adjust path if needed
import * as WebcamContext from "../webcam/WebcamContext";

// Mock global Worker if not available (Node environment)
class WorkerMock {
  onmessage = () => {};
  postMessage = () => {};
  terminate = () => {};
}
globalThis.Worker = WorkerMock as any;


// Create mock toggle functions
const mockSetWebcamActive = vi.fn();
const mockSetMirrored = vi.fn();
const mockSetShowLandmarks = vi.fn();
const mockSetIsFullscreen = vi.fn();
const mockSetShowPrediction = vi.fn();

beforeEach(() => {
  // Clear calls before each test
  vi.clearAllMocks();

  // Mock the useWebcam hook
  vi.spyOn(WebcamContext, "useWebcam").mockReturnValue({
    webcamActive: false,
    setWebcamActive: mockSetWebcamActive,
    mirrored: false,
    setMirrored: mockSetMirrored,
    showLandmarks: false,
    setShowLandmarks: mockSetShowLandmarks,
    isFullscreen: false,
    setIsFullscreen: mockSetIsFullscreen,
    showPrediction: false,
    setShowPrediction: mockSetShowPrediction,
  });
});

describe("WebcamCard", () => {
  it("renders all 5 control buttons and toggles state on click", () => {
    render(<WebcamCard onPredictionResult={() => {}} />);

    const startStopBtn = screen.getByLabelText(/start camera/i);
    const mirrorBtn = screen.getByLabelText(/mirror video/i);
    const landmarksBtn = screen.getByLabelText(/show landmarks/i);
    const predictionBtn = screen.getByLabelText(/start predictions/i);
    const fullscreenBtn = screen.getByLabelText(/enter full-screen/i);

    // Click all buttons
    fireEvent.click(startStopBtn);
    fireEvent.click(mirrorBtn);
    fireEvent.click(landmarksBtn);
    fireEvent.click(predictionBtn);
    fireEvent.click(fullscreenBtn);

    // Verify toggles are triggered
    expect(mockSetWebcamActive).toHaveBeenCalledWith(true);
    expect(mockSetMirrored).toHaveBeenCalledWith(true);
    expect(mockSetShowLandmarks).toHaveBeenCalledWith(true);
    expect(mockSetShowPrediction).toHaveBeenCalledWith(true);
    expect(mockSetIsFullscreen).toHaveBeenCalledWith(true);
  });
});
