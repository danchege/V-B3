module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_', 
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }],
    'consistent-return': 'off',
    'object-shorthand': 'off',
    'import/order': 'off',
    'no-await-in-loop': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
    'func-names': 'off',
    'global-require': 'off',
    'import/newline-after-import': 'off',
    'no-use-before-define': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
