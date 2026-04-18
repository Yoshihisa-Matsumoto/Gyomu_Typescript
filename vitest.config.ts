import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
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
  },
});
