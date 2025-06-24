// setup-tests.ts
import '@testing-library/jest-dom';

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({}),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
});

