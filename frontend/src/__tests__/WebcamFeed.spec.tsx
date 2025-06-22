import { render, screen } from '@testing-library/react';
import WebcamFeed from '../webcam/WebcamFeed';
import '@testing-library/jest-dom'

// Mock react-webcam to avoid actual camera
jest.mock('react-webcam', () => () => <video data-testid="mock-webcam" />);

// Mock the custom hook (hand tracking)
jest.mock('../hooks/useHandTracking', () => ({
  useHandTracking: () => {},
}));


describe('WebcamFeed', () => {
  it('renders the canvas and webcam when active', () => {
    const { container } = render(
      <WebcamFeed
        isActive={true}
        onPredictionResult={() => {}}
        showPrediction={true}
      />
    );

    expect(screen.getByTestId('mock-webcam')).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('does not render the webcam when inactive', () => {
    const { container } = render(
      <WebcamFeed
        isActive={false}
        onPredictionResult={() => {}}
        showPrediction={true}
      />
    );

    expect(screen.queryByTestId('mock-webcam')).not.toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeInTheDocument(); // still renders
  });
});
