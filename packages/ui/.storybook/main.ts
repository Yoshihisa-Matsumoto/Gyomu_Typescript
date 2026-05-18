import { dirname, resolve } from 'node:path'

import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import type { StorybookConfig } from '@storybook/react-vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-a11y'), getAbsolutePath('@storybook/addon-docs')],
  framework: getAbsolutePath('@storybook/react-vite'),
  viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          '@gyomu/ui': resolve(__dirname, '../src'),
          '@ui': resolve(__dirname, '../src/ui'),
          '@core': resolve(__dirname, '../src/core'),
          '@features': resolve(__dirname, '../src/features'),
        },
      },
    })
  },
}
export default config
