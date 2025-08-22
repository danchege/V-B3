// Combined ESLint configuration with all working components
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
  plugins: ['react', 'react-hooks', 'react-refresh'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    
    // Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    
    // General rules
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_', 
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
    }],
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
    '**/build/**',
    '**/public/**',
    '**/dist/**',
    '**/node_modules/**',
    '**/.*',
    '**/*.md',
    '**/*.mdx',
    '**/*.svg',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.css',
    '**/*.scss',
    '**/*.sass',
    '**/*.less',
    '**/*.styl',
    '**/*.json',
    '**/*.yaml',
    '**/*.yml',
    '**/*.html',
    '**/*.ejs',
    '**/*.handlebars',
    '**/*.hbs',
  ],
};
