import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: ['**/lib/**', '**/coverage/**', '**/node_modules/**', '**/*.cjs', '**/*.mjs'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.d.ts'],
        languageOptions: {
            parser: tseslint.parsers,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals:{
                ...globals.node,
            }
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none'}],
 
        },
    },
    prettier
]