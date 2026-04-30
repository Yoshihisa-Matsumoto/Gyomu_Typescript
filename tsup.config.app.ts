import { defineConfig } from 'tsup';

export const baseConfig = defineConfig({
  format: ['esm'],
  clean: true,
  shims: true,
  target: 'node24',
  platform: 'node',
  bundle: true,
  sourcemap: true,
  splitting: false,
  outDir: 'dist',
  cjsInterop: true,
});
