import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // API files run in Node.js environment
  {
    files: ['api/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Node.js scripts (setup scripts, migrations, etc.)
  {
    files: ['*.js', '**/scripts/**/*.js', '**/migrations/**/*.js'],
    ignores: ['**/src/**', '**/api/**', '**/node_modules/**'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Test files
  {
    files: ['**/*.test.{js,jsx}', '**/__tests__/**/*.{js,jsx}', '**/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]|^_', argsIgnorePattern: '^_' }],
    },
  },
  // E2E test files
  {
    files: ['**/*.spec.{js,jsx}', '**/e2e/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]|^_', argsIgnorePattern: '^_' }],
    },
  },
  // Config files
  {
    files: ['*.config.{js,ts}', 'vitest.config.js', 'playwright.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
])
