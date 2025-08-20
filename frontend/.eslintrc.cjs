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
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react-refresh/only-export-components': 'warn',
  },
  overrides: [
    // Configuration files
    {
      files: ['*.js', '*.cjs'],
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
