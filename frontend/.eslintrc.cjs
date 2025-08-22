module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
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
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_', 
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_'
    }],
    'react-refresh/only-export-components': 'warn',
  },
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    '**/*.config.js',
    '**/*.config.cjs',
    '**/tailwind.config.js',
    '**/postcss.config.js',
    '**/vite.config.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],
  overrides: [
    // Configuration files
    {
      files: ['*.js', '*.cjs', '*.mjs'],
      env: {
        node: true,
      },
      rules: {
        'no-undef': 'off',
      },
    },
    // React components
    {
      files: ['src/**/*.jsx'],
      rules: {
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
  ],
};
