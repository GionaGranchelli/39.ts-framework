import { defineConfig } from 'vitest/config';
import * as path from 'path';
import { resolve } from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  test: {
    include: [
      'core/**/*.test.{ts,js}',
      'dom/**/*.test.{ts,js}',
      'components/**/*.test.{ts,js}',
      'storage/**/*.test.{ts,js}',
    ],
    exclude: ['dist', 'node_modules'],
    globals: true,
    environment: 'jsdom',
    watch: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      // Use the compiled output with proper ESM resolution
      '39.ts': resolve(__dirname, './dist/index.js'),
    }
  },
  esbuild: {
    // Ensure proper ESM handling
    target: 'es2022',
    format: 'esm'
  }
});