import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'text-encoding';

// Patch globalThis with compatible encoders if missing
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}

