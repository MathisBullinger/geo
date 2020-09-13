module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  plugins: ['svelte3'],
  extends: ['eslint:recommended'],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  rules: {
    semi: ['error', 'never'],
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unreachable': 'warn',
    'require-await': 'warn',
    'no-else-return': ['warn', { allowElseIf: false }],
  },
}
