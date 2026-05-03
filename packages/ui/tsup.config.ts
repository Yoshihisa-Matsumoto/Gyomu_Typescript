import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'controls/table': 'src/controls/table.ts',
    'controls/markdown': 'src/controls/markdown.ts',
    'controls/capture': 'src/controls/capture.ts',
  },
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
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
});
