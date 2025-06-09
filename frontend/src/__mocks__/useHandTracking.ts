export default function useHandTracking() {
  return {
    isTracking: false,
    handData: null,
    startTracking: jest.fn(),
    stopTracking: jest.fn(),
  };
}
