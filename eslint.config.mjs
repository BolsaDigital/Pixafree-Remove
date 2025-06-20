import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importHelpers from 'eslint-plugin-import-helpers';
import react from 'eslint-plugin-react';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/*',
      '**/out/*',
      '**/public/*',
      '**/dist/*',
      '**/.next/*',
      '**/coverage',
      'src/styles/globals.css',
    ],
  },
  ...compat.extends(
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ),
  {
    plugins: {
      react,
      '@typescript-eslint': typescriptEslint,
      'import-helpers': importHelpers,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 11,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      '@typescript-eslint/ban-ts-comment': 0,
      'import/no-anonymous-default-export': 0,
      '@typescript-eslint/no-explicit-any': 0,
      'react-hooks/exhaustive-deps': 0,
      'tailwindcss/no-custom-classname': 0,
      'newline-before-return': 2,
      'react/prop-types': 0,
      'react/react-in-jsx-scope': 0,
      'import-helpers/order-imports': [
        2,
        {
          newlinesBetween: 'always',

          groups: [
            ['/^next/', 'module'],
            '/^@/styles/',
            '/^@/components/',
            '/^@/lib/',
            ['parent', 'sibling', 'index'],
          ],

          alphabetize: {
            order: 'asc',
            ignoreCase: true,
          },
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        2,
        {
          argsIgnorePattern: '^_',
        },
      ],

      'no-console': [
        2,
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },
];

export default eslintConfig;
