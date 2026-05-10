// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import js from '@eslint/js'
import tseslint, { parser } from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { tanstackConfig } from '@tanstack/eslint-config'
import globals from 'globals'
import unusedImports from 'eslint-plugin-unused-imports'
export default [
  {
    ignores: [
      '**/lib/**',
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.output/**',
      '**/.vinxi/**',
      '**/.tanstack/**',
      '**/.nitro/**',
      '**/*.cjs',
      '**/*.mjs',
      '!.storybook',
      '.prettierrc.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tanstackConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'unused-imports/no-unused-imports': 'error',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['src/*'],
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',

        {
          selector: 'typeParameter',
          format: ['PascalCase'],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      ' @typescript-eslint/no-unnecessary-condition': 'off',
    },
  },

  prettier,
  ...storybook.configs['flat/recommended'],
]
