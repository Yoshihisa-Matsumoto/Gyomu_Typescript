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
    pool: 'threads', // forks → threads
    fileParallelism: true, // 並列ON（デフォルトでもOK）
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
    },
    setupFiles: ['./test/setup.ts'],
  },
});
