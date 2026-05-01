import { defineConfig } from 'vitest/config';
import { initLoggerFromEnv } from './src/logger/pinoLogger';
await initLoggerFromEnv();
//console.log('Env', process.env);
export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.test.{ts,tsx,js}'],
    environment: 'node',
    globals: true,
    clearMocks: true,
    // onConsoleLog() {
    //   return true;
    // },
    logHeapUsage: false,
    printConsoleTrace: false,
    disableConsoleIntercept: true,
    pool: 'forks',
    fileParallelism: false,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
});
