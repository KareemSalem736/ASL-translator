// setup-tests.ts
import '@testing-library/jest-dom';

// setup-tests.ts

// @ts-ignore
globalThis.MediaStream = class {
  getTracks() {
    return [];
  }
};



Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({}),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
});

