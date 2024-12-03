// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['**/dist/*', 'playground/*', 'docs/*', 'scripts/*'],
  },
  ...tseslint.config(
    eslint.configs.recommended, // enable eslint:recommended
    ...tseslint.configs.strict, // a superset of recommended that includes more opinionated rules which may also catch bugs.
  ),
  stylistic.configs['recommended-flat'],
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn', // or "error"
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'vue/one-component-per-file': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
    },
  },
]
