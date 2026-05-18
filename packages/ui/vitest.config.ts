import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    isolate: false,
    include:
      mode === 'sit'
        ? ['src/**/__sit__/**/?(*.)+(spec|test).+(ts|tsx|js)']
        : ['src/**/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'core/**/*.ts',
        'features/**/*.ts',
        'features/form/AutoField.tsx',
        'features/form/AutoForm.tsx',
      ],
      exclude: [
        'node_modules/',
        'dist/',

        // UIの薄いラッパーは除外
        '**/ui/adapters/mui/**',

        // barrel
        '**/index.ts',

        // 型定義
        '**/*.d.ts',
      ],
    },
    restoreMocks: mode === 'sit' ? false : true,
  },
}))
