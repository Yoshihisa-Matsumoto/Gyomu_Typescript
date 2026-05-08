import path from 'path';
import { defineConfig } from 'vitest/config';
//console.log('Env', process.env);
export default defineConfig({
  resolve: {
    alias: {
      '@data': path.resolve(__dirname, 'src/data'),
      '@error': path.resolve(__dirname, 'src/error'),
      '@gyomu': path.resolve(__dirname, 'src/gyomu'),
      '@schemas': path.resolve(__dirname, 'src/schemas'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@usecase': path.resolve(__dirname, 'src/usecase'),
    },
  },
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
  },
});
