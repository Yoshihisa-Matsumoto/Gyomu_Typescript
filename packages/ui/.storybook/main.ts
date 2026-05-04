import type { StorybookConfig } from '@storybook/react-vite';

import { dirname, resolve } from 'path';

import { fileURLToPath } from 'url';
import { mergeConfig } from 'vite';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
  ],
  framework: getAbsolutePath('@storybook/react-vite'),
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      resolve: {
        alias: {
          '@gyomu/ui': resolve(__dirname, '../src'),
        },
      },
    });
  },
};
export default config;
