import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vitest from '@vitest/eslint-plugin';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },
  {
    files: ['test/**/*.spec.js'],
    plugins: { vitest },
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
  },
  {
    ignores: ['out/', 'build/', 'build-archive/', 'node_modules/', 'test/unit/coverage/'],
  },
];
