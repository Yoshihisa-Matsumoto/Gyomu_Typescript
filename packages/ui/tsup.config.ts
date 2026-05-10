import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.stories.tsx': 'tsx',
    }
  },
  external: [
    'react',
    'react-dom',
    '@emotion/cache',
    '@emotion/react',
    '@emotion/styled',
    '@mui/icons-material',
    '@mui/material',
    '@mui/material-nextjs',
    '@mui/x-date-pickers',
    'highlight.js',
    'html2canvas',
    'marked',
    'material-react-table',
    'mermaid',
  ],
})
