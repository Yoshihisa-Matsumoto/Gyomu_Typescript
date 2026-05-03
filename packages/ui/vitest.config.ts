import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  test: {
    environment: 'jsdom',
    globals: true,
    include:
      mode === 'sit'
        ? ['src/**/__sit__/**/?(*.)+(spec|test).+(ts|tsx|js)']
        : ['src/**/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)'],
    coverage: {
      exclude: [
        '!src/**/__tests__/**',
        '!src/**/?(*.)+(spec|test).+(ts|tsx|js)',
      ],
    },
    restoreMocks: mode === 'sit' ? false : true,
  },
}));
