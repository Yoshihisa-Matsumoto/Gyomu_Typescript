import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.test.{ts,tsx,js}'],
    environment: 'node',
    globals: true,
    setupFiles: ['src/__tests__/baseDBClass.ts'],
    clearMocks: true,
  },
});
