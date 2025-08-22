// Minimal ESLint configuration to test basic functionality
'use strict';

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
  },
  ignorePatterns: ['node_modules', 'dist', '*.config.js'],
};
