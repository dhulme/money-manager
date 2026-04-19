import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vitest from '@vitest/eslint-plugin';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    ignores: ['out/', 'build/', 'build-archive/', 'dist/', 'node_modules/', 'test/unit/coverage/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['src/main/**/*.{js,ts}', 'src/preload/**/*.{js,ts}', 'electron.vite.config.*', 'eslint.config.*', 'vitest.config.*'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },
  {
    files: ['src/preload/**/*.{js,ts}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['test/**/*.spec.{js,ts}'],
    plugins: { vitest },
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
  },
];
