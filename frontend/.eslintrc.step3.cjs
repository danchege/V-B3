// Step 3: Add Babel parser for modern JavaScript features
'use strict';

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    '*.config.js',
    '*.config.cjs',
    'vite.config.js',
    'postcss.config.js',
    'tailwind.config.js',
    '**/*.test.js',
    '**/*.spec.js',
    '**/__tests__/**',
    '**/__mocks__/**',
    '**/test/**',
    '**/coverage/**',
  ],
};
