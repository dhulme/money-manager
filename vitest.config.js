import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: '.',
    include: ['test/unit/specs/**/*.spec.{js,ts}'],
    setupFiles: ['test/unit/setup.js'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
});
