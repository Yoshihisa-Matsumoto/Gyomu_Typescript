import type { Config } from 'prettier'

const config: Config = {
  singleQuote: true,
  semi: false,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  trailingComma: 'all',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['cn', 'cva'],
}

export default config
