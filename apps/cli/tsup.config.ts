import { defineConfig } from 'tsup'
import { baseConfig } from '../../tsup.config.app'

export default defineConfig({
  ...baseConfig,
  entry: ['src/synchHolidayJob.ts', 'src/gyomu.ts'],
  noExternal: ['common', 'nodejs-common'],
  outDir: 'dist',
})
