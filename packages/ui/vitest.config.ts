import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@core': path.resolve(__dirname, 'src/core'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
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
}));
