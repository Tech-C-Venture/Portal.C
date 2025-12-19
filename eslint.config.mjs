import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import globals from 'globals';

const layerRestrictions = [
  // Domain: Can only import from itself and shared libraries
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/application/*', '@/infrastructure/*', '@/presentation/*'],
              message: 'Domain layer cannot import from other layers.',
            },
          ],
        },
      ],
    },
  },
  // Application: Can import from domain
  {
    files: ['src/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/infrastructure/*', '@/presentation/*'],
              message: 'Application layer cannot import from infrastructure or presentation.',
            },
          ],
        },
      ],
    },
  },
  // Infrastructure: Can import from domain and application
  {
    files: ['src/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/presentation/*'],
              message: 'Infrastructure layer cannot import from presentation.',
            },
          ],
        },
      ],
    },
  },
  // Presentation (Next.js app directory): Can import from application and domain
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/infrastructure/*'],
              message: 'Presentation layer cannot import from infrastructure.',
            },
          ],
        },
      ],
    },
  },
];

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    ignores: ['**/.next/**', '**/.vercel/**', '**/node_modules/**', '**/dist/**'],
  },
  // Base JS config
  js.configs.recommended,
  // Base TS config
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': ts,
    },
    languageOptions: {
      parser,
      parserOptions: {},
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...ts.configs['eslint-recommended'].rules,
      ...ts.configs.recommended.rules,
    },
  },
  // Layer dependency rules
  ...layerRestrictions,
];