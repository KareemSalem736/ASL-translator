/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-tests.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'setup-tests.ts',
        '**/vite-env.d.ts',
        '**/*.d.ts',
        '**/*.worker.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**'
      ]
    },
    alias: {
      '^@/(.*)$': '/src/$1'
    }
  }
})
