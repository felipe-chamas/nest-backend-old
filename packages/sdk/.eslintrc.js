/**
 * @type {import('eslint').Linter.Config}
 */
const esconfig = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    semi: [2, 'always'],
    quotes: [2, 'single', { avoidEscape: true }],
    'quote-props': [2, 'as-needed'],
    'max-len': [2, { code: 80, ignoreComments: true }],
    'object-curly-spacing': [2, 'always'],
    'comma-dangle': [2, 'always-multiline'],
    'no-multi-spaces': 2,
    'no-multiple-empty-lines': 2,
    'no-trailing-spaces': 2,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 2,
    '@typescript-eslint/no-empty-interface': 0,
  },
};

module.exports = esconfig;
