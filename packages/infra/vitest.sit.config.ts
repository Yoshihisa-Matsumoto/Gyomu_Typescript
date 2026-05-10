import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
// console.log('Env', process.env);
export default defineConfig({
  test: {
    include: ['src/**/__sit__/**/*.test.{ts,tsx,js}'],
    environment: 'node',
    globals: true,
    clearMocks: true,
    pool: 'threads', // forks → threads
    fileParallelism: true, // 並列ON（デフォルトでもOK）
    setupFiles: ['./test/setup.ts'],
    teardownTimeout: 0, // ← 重要
    hookTimeout: 0,
  },
})
