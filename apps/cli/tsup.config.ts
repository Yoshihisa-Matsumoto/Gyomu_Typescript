import { defineConfig } from 'tsup';
import { baseConfig } from '../../tsup.config.app';
export default defineConfig({
  ...baseConfig,
  entry: ['src/deployTool.ts'],
  noExternal: ['common', 'nodejs-common'],
  outDir: 'dist',
});
