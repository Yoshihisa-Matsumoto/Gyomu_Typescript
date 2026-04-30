import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: [
      'src/**/__sit__/**/*.test.{ts,tsx,js}',
      'src/**/__tests__/**/*.test.{ts,tsx,js}',
    ],
    environment: 'node',
    globals: true,
    clearMocks: true,
    pool: 'forks',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
    setupFiles: ['./test/setup.ts'],
  },
});
