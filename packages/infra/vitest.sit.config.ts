import { defineConfig } from 'vitest/config';

//console.log('Env', process.env);
export default defineConfig({
  test: {
    include: ['src/**/__sit__/**/*.test.{ts,tsx,js}'],
    environment: 'node',
    globals: true,
    clearMocks: true,
    pool: 'threads', // forks → threads
    fileParallelism: true, // 並列ON（デフォルトでもOK）
    setupFiles: ['./test/setup.ts'],
  },
});
