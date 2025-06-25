// setup-tests.ts
import '@testing-library/jest-dom';

// setup-tests.ts

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
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

